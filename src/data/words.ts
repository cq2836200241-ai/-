export interface WordItem {
  id: number;
  word: string;
  brief: string;
}

const baseWords: Array<[string, string]> = [
  ["ability", "能力"], ["able", "能够"], ["about", "关于"], ["above", "在...上面"], ["accept", "接受"],
  ["according", "根据"], ["account", "账户"], ["across", "横穿"], ["act", "行动"], ["action", "行动"],
  ["activity", "活动"], ["actually", "实际上"], ["add", "增加"], ["address", "地址"], ["administration", "管理"],
  ["admit", "承认"], ["adult", "成人"], ["affect", "影响"], ["after", "在...之后"], ["again", "再次"],
  ["against", "反对"], ["age", "年龄"], ["agency", "代理机构"], ["agent", "代理人"], ["ago", "以前"],
  ["agree", "同意"], ["agreement", "协议"], ["ahead", "在前面"], ["air", "空气"], ["all", "所有"],
  ["allow", "允许"], ["almost", "几乎"], ["alone", "单独"], ["along", "沿着"], ["already", "已经"],
  ["also", "也"], ["although", "虽然"], ["always", "总是"], ["American", "美国的"], ["among", "在...之中"],
  ["amount", "数量"], ["analysis", "分析"], ["and", "和"], ["animal", "动物"], ["another", "另一个"],
  ["answer", "回答"], ["any", "任何"], ["anyone", "任何人"], ["anything", "任何事"], ["appear", "出现"],
  ["apply", "应用"], ["approach", "方法"], ["area", "区域"], ["argue", "争论"], ["arm", "手臂"],
  ["around", "周围"], ["arrive", "到达"], ["art", "艺术"], ["article", "文章"], ["artist", "艺术家"],
  ["as", "作为"], ["ask", "问"], ["assume", "假设"], ["at", "在"], ["attack", "攻击"],
  ["attention", "注意力"], ["attorney", "律师"], ["audience", "观众"], ["author", "作者"], ["authority", "权威"],
  ["available", "可获得的"], ["avoid", "避免"], ["away", "离开"], ["baby", "婴儿"], ["back", "后面"],
  ["bad", "坏的"], ["bag", "包"], ["ball", "球"], ["bank", "银行"], ["bar", "酒吧"],
  ["base", "基础"], ["be", "是"], ["beat", "打败"], ["beautiful", "美丽的"], ["because", "因为"],
  ["become", "成为"], ["bed", "床"], ["before", "在...之前"], ["begin", "开始"], ["behavior", "行为"],
  ["behind", "在...后面"], ["believe", "相信"], ["benefit", "利益"], ["best", "最好的"], ["better", "更好的"],
  ["between", "在...之间"], ["beyond", "超越"], ["big", "大的"], ["bill", "账单"], ["billion", "十亿"],
  ["bit", "一点"], ["black", "黑色的"], ["blood", "血"], ["blue", "蓝色的"], ["board", "木板"],
  ["body", "身体"], ["book", "书"], ["born", "出生"], ["both", "两者"], ["box", "盒子"],
  ["boy", "男孩"], ["break", "打破"], ["bring", "带来"], ["brother", "兄弟"], ["budget", "预算"],
  ["build", "建立"], ["building", "建筑物"], ["business", "商业"], ["but", "但是"], ["buy", "买"],
  ["by", "通过"], ["call", "叫"], ["camera", "相机"], ["campaign", "运动"], ["can", "能"],
  ["cancer", "癌症"], ["candidate", "候选人"], ["capital", "首都"], ["car", "汽车"], ["card", "卡片"],
  ["care", "关心"], ["career", "职业"], ["carry", "携带"], ["case", "情况"], ["catch", "抓住"],
  ["cause", "原因"], ["cell", "细胞"], ["center", "中心"], ["central", "中心的"], ["century", "世纪"],
  ["certain", "确定的"], ["certainly", "确实"], ["chair", "椅子"], ["challenge", "挑战"], ["chance", "机会"],
  ["change", "改变"], ["character", "角色"], ["charge", "收费"], ["check", "检查"], ["child", "孩子"],
  ["choice", "选择"], ["choose", "选择"], ["church", "教堂"], ["citizen", "公民"], ["city", "城市"],
  ["civil", "市民的"], ["claim", "声称"], ["class", "阶级"], ["clear", "清楚的"], ["clearly", "清楚地"],
  ["close", "关闭"], ["coach", "教练"], ["cold", "冷的"], ["collection", "收集"], ["college", "大学"],
  ["color", "颜色"], ["come", "来"], ["commercial", "商业的"], ["common", "共同的"], ["community", "社区"],
  ["company", "公司"], ["compare", "比较"], ["computer", "电脑"], ["concern", "关心"], ["condition", "条件"],
  ["conference", "会议"], ["Congress", "国会"], ["consider", "考虑"], ["consumer", "消费者"], ["contain", "包含"],
  ["continue", "继续"], ["control", "控制"], ["cost", "成本"], ["could", "可以"], ["country", "国家"],
  ["couple", "一对"], ["course", "课程"], ["court", "法庭"], ["cover", "覆盖"], ["create", "创造"],
  ["crime", "犯罪"], ["cultural", "文化的"], ["culture", "文化"], ["cup", "杯子"], ["current", "当前的"],
  ["customer", "顾客"], ["cut", "切"], ["dark", "黑暗的"], ["data", "数据"], ["daughter", "女儿"],
  ["day", "天"], ["dead", "死去的"], ["deal", "交易"], ["death", "死亡"], ["debate", "辩论"],
  ["decade", "十年"], ["decide", "决定"], ["decision", "决定"], ["deep", "深的"], ["defense", "防御"],
  ["degree", "程度"], ["Democrat", "民主党人"], ["democratic", "民主的"], ["describe", "描述"], ["design", "设计"],
  ["despite", "尽管"], ["detail", "细节"], ["determine", "决定"], ["develop", "发展"], ["development", "发展"],
  ["die", "死亡"], ["difference", "不同"], ["different", "不同的"], ["difficult", "困难的"], ["dinner", "晚餐"],
  ["direction", "方向"], ["director", "导演"], ["discover", "发现"], ["discuss", "讨论"], ["disease", "疾病"],
  ["do", "做"], ["doctor", "医生"], ["dog", "狗"], ["door", "门"], ["down", "向下"],
  ["draw", "画"], ["dream", "梦想"], ["drive", "驾驶"], ["drop", "掉落"], ["drug", "药物"],
  ["during", "在...期间"], ["each", "每个"], ["early", "早的"], ["east", "东方"], ["easy", "容易的"],
  ["eat", "吃"], ["economic", "经济的"], ["economy", "经济"], ["edge", "边缘"], ["education", "教育"],
  ["effect", "效果"], ["effort", "努力"], ["eight", "八"], ["either", "也"], ["election", "选举"],
  ["else", "否则"], ["employee", "员工"], ["end", "结束"], ["energy", "能量"], ["enjoy", "享受"],
  ["enough", "足够的"], ["enter", "进入"], ["entire", "整个的"], ["environment", "环境"], ["environmental", "环境的"],
  ["especially", "特别是"], ["establish", "建立"], ["even", "甚至"], ["evening", "傍晚"], ["event", "事件"],
  ["ever", "曾经"], ["every", "每个"], ["everybody", "每人"], ["everyone", "所有人"], ["everything", "一切事物"],
  ["evidence", "证据"], ["exactly", "确切地"], ["example", "例子"], ["executive", "执行的"], ["exist", "存在"],
  ["expect", "期待"], ["experience", "经历"], ["expert", "专家"], ["explain", "解释"], ["eye", "眼睛"],
  ["face", "脸"], ["fact", "事实"], ["factor", "因素"], ["fail", "失败"], ["fall", "落下"],
  ["family", "家庭"], ["far", "远的"], ["fast", "快的"], ["father", "父亲"], ["fear", "害怕"],
  ["federal", "联邦的"], ["feel", "感觉"], ["feeling", "感觉"], ["few", "少数的"], ["field", "场地"],
  ["fight", "战斗"], ["figure", "数字"], ["fill", "装满"], ["film", "电影"], ["final", "最终的"],
  ["finally", "最终"], ["financial", "金融的"], ["find", "发现"], ["fine", "好的"], ["finger", "手指"],
  ["finish", "完成"], ["fire", "火"], ["firm", "公司"], ["first", "第一"], ["fish", "鱼"],
  ["five", "五"], ["floor", "地板"], ["fly", "飞"], ["focus", "焦点"], ["follow", "跟随"],
  ["food", "食物"], ["foot", "脚"], ["for", "为了"], ["force", "力量"], ["foreign", "外国的"]
];

// Generate 3000 words. For demonstration, we cycle through the base words.
export const wordsList: WordItem[] = Array.from({ length: 3000 }).map((_, i) => {
  if (i < baseWords.length) {
    return { id: i + 1, word: baseWords[i][0], brief: baseWords[i][1] };
  } else {
    const base = baseWords[i % baseWords.length];
    return { id: i + 1, word: base[0], brief: base[1] };
  }
});
