import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';

interface PromptBlock {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  content: string;
  contentEn: string;
}

const promptBlocks: PromptBlock[] = [
  {
    title: '长文写作提示词',
    titleEn: 'Long-form Writing Prompt',
    description: '生成结构化、具备叙事节奏的技术长文',
    descriptionEn: 'Produce structured, narrative-driven technical articles',
    content: `你是一位资深技术作者，请针对输入的主题生成一篇不少于 1500 字的文章。写作要求：
1. 先给出 3-5 句的摘要结论。
2. 文章主体按「背景 → 痛点 → 解决思路 → 关键步骤 → 风险与注意事项 → 总结与行动建议」组织。
3. 每个部分使用二级标题，关键结论用项目符号突出。
4. 引用外部数据或案例时，注明来源或提供可验证的描述。
5. 语言风格保持专业，同时便于普通开发者理解。
输出格式仅包含 Markdown，不需要额外解释。`,
    contentEn: `You are a senior technical writer. Produce an article of at least 1,500 Chinese characters based on the given topic.
Requirements:
1. Begin with a 3-5 sentence executive summary.
2. Structure the body with the sections "Background → Pain Points → Solution Overview → Key Steps → Risks & Caveats → Summary & Action Items".
3. Use level-2 headings for each section and highlight critical takeaways with bullet lists.
4. Cite data or case studies with verifiable sources where possible.
5. Keep the tone professional yet accessible for general developers.
Return Markdown only, no extra commentary.`
  },
  {
    title: '产品调研分析提示词',
    titleEn: 'Product Research Prompt',
    description: '快速调研竞品并输出对比表与策略建议',
    descriptionEn: 'Rapidly compare competitors and deliver strategy insights',
    content: `请充当产品运营顾问，围绕「{输入的产品方向}」完成调研分析：
- 罗列至少 4 个代表性竞品，按「名称 / 核心定位 / 关键功能 / 价格策略 / 目标用户」生成对比表。
- 分析竞品的共同成功因素与差异化策略，各列出 3 点。
- 结合我的资源和能力，给出 3 条可执行的切入策略，并说明优先级、投入预估与衡量指标。
- 最后总结整体市场机会与潜在风险，各 3 条。
请用 Markdown 输出，表格使用标准语法。`,
    contentEn: `Act as a product operations consultant and analyse the market for "{input product}". Deliver:
- A comparison table of at least four representative competitors with columns: Name / Positioning / Key Features / Pricing / Target Users.
- Three shared success factors and three differentiating strategies observed among competitors.
- Three actionable go-to-market strategies tailored to my resources, each with priority, required effort estimate, and success metrics.
- Three market opportunities and three major risks.
Return everything in Markdown, using proper table syntax.`
  },
  {
    title: '代码审查提示词',
    titleEn: 'Code Review Prompt',
    description: '对 PR 进行安全与回归风险审查',
    descriptionEn: 'Review pull requests for bugs and regressions',
    content: `你是一名资深全栈工程师，请审查下面的代码 diff。
任务：
1. 优先识别功能性错误、边界情况遗漏、性能或安全风险。
2. 判断是否存在回归风险，并指出缺失的测试覆盖点。
3. 给出最重要的 3 条改进建议。若问题严重，请明确标出阻塞（blocking）。
4. 输出结构：
   - Findings: 列表，按严重程度排序。
   - Tests: 建议补充或执行的测试。
   - Summary: 对整体质量和是否可合并的结论。
请全程使用中文回复。`,
    contentEn: `You are a senior full-stack engineer. Review the following code diff focusing on:
1. Functional bugs, edge cases, performance or security risks.
2. Potential regressions and missing test coverage.
3. The three most critical improvement suggestions; mark items as blocking if they prevent merge.
4. Structure the response with sections: Findings (severity-ordered list), Tests (recommended checks), Summary (overall assessment and merge readiness).
Respond in English.`
  },
  {
    title: '危机通报提示词',
    titleEn: 'Incident Report Prompt',
    description: '快速形成面对客户的故障公告',
    descriptionEn: 'Craft customer-ready outage communications fast',
    content: `请以客服负责人身份撰写一次服务故障的通报，输入包括「事件时间线、影响范围、根因、当前状态」。输出要求：
- 标题简洁，明确事故等级。
- 正文依次包含：事件概述、影响范围、客户行动建议、临时缓解措施、后续计划、我们如何防止复发。
- 提供时间线表格，列出关键节点和责任团队。
- 全文保持专业、克制、真诚。
使用 Markdown，避免夸张语气。`,
    contentEn: `As the head of customer support, draft an outage announcement based on the provided timeline, impact, root cause, and current status.
Output must include:
- A concise title with the incident severity.
- Sections: Overview, Impact, Recommended Customer Actions, Temporary Mitigations, Next Steps, How We Prevent Recurrence.
- A timeline table listing key events and owning teams.
- A professional, candid tone without exaggeration.
Return in Markdown.`
  }
];

export default function MyPromptPage() {
  const { language, isDark } = useAppContext();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(language === 'zh' ? '提示词已复制到剪贴板' : 'Prompt copied to clipboard');
    } catch (error) {
      alert(language === 'zh' ? '复制失败，请手动复制' : 'Copy failed, please copy manually');
    }
  };

  return (
    <PageContainer title="我的提示词" titleEn="My Prompt" language={language} isDark={isDark}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promptBlocks.map((prompt, index) => {
          const copyContent = language === 'zh' ? prompt.content : (prompt.contentEn || prompt.content);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleCopy(copyContent)}
              className={`text-left rounded-lg p-6 transition-all duration-200 hover:shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 active:scale-95 ${
                isDark
                  ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white'
                  : 'glass-light text-black'
              }`}
            >
              <h2 className="text-xl font-bold mb-2">
                {language === 'zh' ? prompt.title : prompt.titleEn}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-black'} mb-3`}>
                {language === 'zh' ? prompt.description : prompt.descriptionEn}
              </p>
              <div className={`inline-flex items-center px-4 py-2 rounded-lg font-bold ${
                isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {language === 'zh' ? '点击复制提示词' : 'Click to copy prompt'}
              </div>
            </button>
          );
        })}
      </div>
    </PageContainer>
  );
}
