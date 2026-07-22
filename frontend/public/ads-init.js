const isStorePage = window.location.hostname.startsWith('store.')
  || window.location.hostname.startsWith('fire.')
  || window.location.pathname.startsWith('/mystore')
  || window.location.pathname.startsWith('/admin');

if (!isStorePage) {
  const ad = document.createElement('ins');
  ad.className = 'adsbygoogle';
  ad.style.display = 'block';
  ad.dataset.adClient = 'ca-pub-6441088232603768';
  ad.dataset.adSlot = '2936592780';
  ad.dataset.adFormat = 'auto';
  ad.dataset.fullWidthResponsive = 'true';
  document.body.appendChild(ad);
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({});
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6441088232603768';
  document.head.appendChild(script);
}
