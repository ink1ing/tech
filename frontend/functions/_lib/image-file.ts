const signatures = {
  'image/jpeg': (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes: Uint8Array) =>
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value),
  'image/webp': (bytes: Uint8Array) =>
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP',
} as const;

export async function readVerifiedImage(file: File, maximumBytes = 5 * 1024 * 1024) {
  if (file.size === 0) throw new Error('请选择图片');
  if (file.size > maximumBytes) throw new Error('图片不能超过 5MB');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = (Object.keys(signatures) as Array<keyof typeof signatures>)
    .find(type => signatures[type](bytes));
  if (!contentType || file.type !== contentType) throw new Error('图片文件内容无效，仅支持真实的 JPG、PNG 或 WebP');
  if (!hasValidEnd(bytes, contentType)) throw new Error('图片文件结构无效或包含附加内容');
  const dimensions = readDimensions(bytes, contentType);
  if (!dimensions) throw new Error('无法读取图片尺寸');
  const { width, height } = dimensions;
  if (width > 8192 || height > 8192 || width * height > 25_000_000) {
    throw new Error('图片尺寸过大，最长边不能超过 8192 像素且总像素不能超过 2500 万');
  }
  const extension = contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg';
  return { bytes, contentType, extension };
}

function hasValidEnd(bytes: Uint8Array, contentType: keyof typeof signatures) {
  if (contentType === 'image/jpeg') return bytes.length >= 4 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9;
  if (contentType === 'image/png') {
    return bytes.length >= 20
      && bytes.at(-12) === 0 && bytes.at(-11) === 0 && bytes.at(-10) === 0 && bytes.at(-9) === 0
      && String.fromCharCode(...bytes.slice(-8, -4)) === 'IEND';
  }
  const declaredSize = readUint32LE(bytes, 4);
  return declaredSize !== null && declaredSize + 8 === bytes.length;
}

function readDimensions(bytes: Uint8Array, contentType: keyof typeof signatures) {
  if (contentType === 'image/png') {
    const width = readUint32BE(bytes, 16);
    const height = readUint32BE(bytes, 20);
    return width && height ? { width, height } : null;
  }
  if (contentType === 'image/jpeg') return readJpegDimensions(bytes);
  return readWebpDimensions(bytes);
}

function readJpegDimensions(bytes: Uint8Array) {
  const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const segmentLength = readUint16BE(bytes, offset);
    if (!segmentLength || segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    if (startOfFrameMarkers.has(marker)) {
      const height = readUint16BE(bytes, offset + 3);
      const width = readUint16BE(bytes, offset + 5);
      return width && height ? { width, height } : null;
    }
    offset += segmentLength;
  }
  return null;
}

function readWebpDimensions(bytes: Uint8Array) {
  if (bytes.length < 30) return null;
  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  if (chunk === 'VP8X') {
    const width = readUint24LE(bytes, 24);
    const height = readUint24LE(bytes, 27);
    return width === null || height === null ? null : { width: width + 1, height: height + 1 };
  }
  if (chunk === 'VP8L' && bytes[20] === 0x2f) {
    const bits = readUint32LE(bytes, 21);
    return bits === null ? null : { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    const width = readUint16LE(bytes, 26);
    const height = readUint16LE(bytes, 28);
    return width === null || height === null ? null : { width: width & 0x3fff, height: height & 0x3fff };
  }
  return null;
}

function readUint16BE(bytes: Uint8Array, offset: number) {
  return offset + 2 <= bytes.length ? (bytes[offset] << 8) | bytes[offset + 1] : null;
}

function readUint16LE(bytes: Uint8Array, offset: number) {
  return offset + 2 <= bytes.length ? bytes[offset] | (bytes[offset + 1] << 8) : null;
}

function readUint24LE(bytes: Uint8Array, offset: number) {
  return offset + 3 <= bytes.length ? bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) : null;
}

function readUint32BE(bytes: Uint8Array, offset: number) {
  if (offset + 4 > bytes.length) return null;
  return ((bytes[offset] * 0x1000000) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]) >>> 0;
}

function readUint32LE(bytes: Uint8Array, offset: number) {
  if (offset + 4 > bytes.length) return null;
  return (bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16) + (bytes[offset + 3] * 0x1000000)) >>> 0;
}
