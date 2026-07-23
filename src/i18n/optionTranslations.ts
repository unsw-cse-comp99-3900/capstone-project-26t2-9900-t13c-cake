import type { Language } from "./translations";

type Glossary = Record<string, string>;

const zh: Glossary = {
  National: "全国", "Australian Capital Territory": "澳大利亚首都领地",
  "New South Wales": "新南威尔士州", "Northern Territory": "北领地",
  Queensland: "昆士兰州", "South Australia": "南澳大利亚州", Tasmania: "塔斯马尼亚州",
  Victoria: "维多利亚州", "Western Australia": "西澳大利亚州",
  Disability: "残障", "General Public": "普通公众", "Medical Conditions": "疾病",
  "Mental Health": "心理健康", Research: "研究", "Social Services": "社会服务",
  "Victims of Crime": "犯罪受害者", "Women's health and OB/GYN": "女性健康与妇产科",
  Inform: "告知", Consult: "咨询", Involve: "参与", Collaborate: "协作",
  Empower: "赋权", "Extended roles": "扩展角色",
};

const fr: Glossary = {
  National: "National", "Australian Capital Territory": "Territoire de la capitale australienne",
  "New South Wales": "Nouvelle-Galles du Sud", "Northern Territory": "Territoire du Nord",
  Queensland: "Queensland", "South Australia": "Australie-Méridionale", Tasmania: "Tasmanie",
  Victoria: "Victoria", "Western Australia": "Australie-Occidentale",
  Disability: "Handicap", "General Public": "Grand public", "Medical Conditions": "Problèmes médicaux",
  "Mental Health": "Santé mentale", Research: "Recherche", "Social Services": "Services sociaux",
  "Victims of Crime": "Victimes d’actes criminels", "Women's health and OB/GYN": "Santé des femmes et obstétrique-gynécologie",
  Inform: "Informer", Consult: "Consulter", Involve: "Impliquer", Collaborate: "Collaborer",
  Empower: "Autonomiser", "Extended roles": "Rôles étendus",
};

const es: Glossary = {
  National: "Nacional", "Australian Capital Territory": "Territorio de la Capital Australiana",
  "New South Wales": "Nueva Gales del Sur", "Northern Territory": "Territorio del Norte",
  Queensland: "Queensland", "South Australia": "Australia Meridional", Tasmania: "Tasmania",
  Victoria: "Victoria", "Western Australia": "Australia Occidental",
  Disability: "Discapacidad", "General Public": "Público general", "Medical Conditions": "Afecciones médicas",
  "Mental Health": "Salud mental", Research: "Investigación", "Social Services": "Servicios sociales",
  "Victims of Crime": "Víctimas de delitos", "Women's health and OB/GYN": "Salud de la mujer y obstetricia/ginecología",
  Inform: "Informar", Consult: "Consultar", Involve: "Involucrar", Collaborate: "Colaborar",
  Empower: "Empoderar", "Extended roles": "Funciones ampliadas",
};

const it: Glossary = {
  National: "Nazionale", "Australian Capital Territory": "Territorio della Capitale Australiana",
  "New South Wales": "Nuovo Galles del Sud", "Northern Territory": "Territorio del Nord",
  Queensland: "Queensland", "South Australia": "Australia Meridionale", Tasmania: "Tasmania",
  Victoria: "Victoria", "Western Australia": "Australia Occidentale",
  Disability: "Disabilità", "General Public": "Pubblico generale", "Medical Conditions": "Condizioni mediche",
  "Mental Health": "Salute mentale", Research: "Ricerca", "Social Services": "Servizi sociali",
  "Victims of Crime": "Vittime di reato", "Women's health and OB/GYN": "Salute della donna e ostetricia/ginecologia",
  Inform: "Informare", Consult: "Consultare", Involve: "Coinvolgere", Collaborate: "Collaborare",
  Empower: "Responsabilizzare", "Extended roles": "Ruoli estesi",
};

const ja: Glossary = {
  National: "全国", "Australian Capital Territory": "オーストラリア首都特別地域",
  "New South Wales": "ニューサウスウェールズ州", "Northern Territory": "ノーザンテリトリー",
  Queensland: "クイーンズランド州", "South Australia": "南オーストラリア州", Tasmania: "タスマニア州",
  Victoria: "ビクトリア州", "Western Australia": "西オーストラリア州",
  Disability: "障害", "General Public": "一般市民", "Medical Conditions": "疾患",
  "Mental Health": "メンタルヘルス", Research: "研究", "Social Services": "社会福祉",
  "Victims of Crime": "犯罪被害者", "Women's health and OB/GYN": "女性の健康・産婦人科",
  Inform: "情報提供", Consult: "意見聴取", Involve: "参加", Collaborate: "協働",
  Empower: "権限付与", "Extended roles": "拡張された役割",
};

const ko: Glossary = {
  National: "전국", "Australian Capital Territory": "오스트레일리아 수도 준주",
  "New South Wales": "뉴사우스웨일스주", "Northern Territory": "노던 준주",
  Queensland: "퀸즐랜드주", "South Australia": "사우스오스트레일리아주", Tasmania: "태즈메이니아주",
  Victoria: "빅토리아주", "Western Australia": "웨스턴오스트레일리아주",
  Disability: "장애", "General Public": "일반 대중", "Medical Conditions": "질환",
  "Mental Health": "정신 건강", Research: "연구", "Social Services": "사회 서비스",
  "Victims of Crime": "범죄 피해자", "Women's health and OB/GYN": "여성 건강 및 산부인과",
  Inform: "정보 제공", Consult: "의견 수렴", Involve: "참여", Collaborate: "협력",
  Empower: "권한 부여", "Extended roles": "확장 역할",
};

const th: Glossary = {
  National: "ทั่วประเทศ", "Australian Capital Territory": "เขตนครหลวงออสเตรเลีย",
  "New South Wales": "นิวเซาท์เวลส์", "Northern Territory": "นอร์เทิร์นเทร์ริทอรี",
  Queensland: "ควีนส์แลนด์", "South Australia": "เซาท์ออสเตรเลีย", Tasmania: "แทสเมเนีย",
  Victoria: "วิกตอเรีย", "Western Australia": "เวสเทิร์นออสเตรเลีย",
  Disability: "ความพิการ", "General Public": "ประชาชนทั่วไป", "Medical Conditions": "ภาวะทางการแพทย์",
  "Mental Health": "สุขภาพจิต", Research: "การวิจัย", "Social Services": "บริการสังคม",
  "Victims of Crime": "ผู้เสียหายจากอาชญากรรม", "Women's health and OB/GYN": "สุขภาพสตรีและสูติ-นรีเวช",
  Inform: "แจ้งข้อมูล", Consult: "ปรึกษา", Involve: "มีส่วนร่วม", Collaborate: "ร่วมมือ",
  Empower: "ให้อำนาจ", "Extended roles": "บทบาทเพิ่มเติม",
};

const vi: Glossary = {
  National: "Toàn quốc", "Australian Capital Territory": "Lãnh thổ Thủ đô Úc",
  "New South Wales": "New South Wales", "Northern Territory": "Lãnh thổ Bắc Úc",
  Queensland: "Queensland", "South Australia": "Nam Úc", Tasmania: "Tasmania",
  Victoria: "Victoria", "Western Australia": "Tây Úc",
  Disability: "Khuyết tật", "General Public": "Công chúng", "Medical Conditions": "Tình trạng y tế",
  "Mental Health": "Sức khỏe tâm thần", Research: "Nghiên cứu", "Social Services": "Dịch vụ xã hội",
  "Victims of Crime": "Nạn nhân tội phạm", "Women's health and OB/GYN": "Sức khỏe phụ nữ và sản phụ khoa",
  Inform: "Cung cấp thông tin", Consult: "Tham vấn", Involve: "Tham gia", Collaborate: "Hợp tác",
  Empower: "Trao quyền", "Extended roles": "Vai trò mở rộng",
};

const glossaries: Partial<Record<Language, Glossary>> = {
  "zh-CN": zh, fr, es, it, ja, ko, th, vi,
};

type LocalisedOption = Record<Exclude<Language, "en">, string>;
const subcategories: Record<string, LocalisedOption> = {
  "Alcohol and other Drugs": {
    "zh-CN": "酒精及其他药物", fr: "Alcool et autres drogues", es: "Alcohol y otras drogas",
    it: "Alcol e altre droghe", ja: "アルコール・その他の薬物", ko: "알코올 및 기타 약물",
    th: "แอลกอฮอล์และสารเสพติดอื่น", vi: "Rượu và các chất gây nghiện khác",
  },
  Allergies: {
    "zh-CN": "过敏", fr: "Allergies", es: "Alergias", it: "Allergie", ja: "アレルギー",
    ko: "알레르기", th: "โรคภูมิแพ้", vi: "Dị ứng",
  },
  Asthma: {
    "zh-CN": "哮喘", fr: "Asthme", es: "Asma", it: "Asma", ja: "喘息",
    ko: "천식", th: "โรคหอบหืด", vi: "Hen suyễn",
  },
  Cancer: {
    "zh-CN": "癌症", fr: "Cancer", es: "Cáncer", it: "Cancro", ja: "がん",
    ko: "암", th: "โรคมะเร็ง", vi: "Ung thư",
  },
  Carers: {
    "zh-CN": "照护者", fr: "Aidants", es: "Cuidadores", it: "Assistenti", ja: "介護者",
    ko: "돌봄 제공자", th: "ผู้ดูแล", vi: "Người chăm sóc",
  },
  "Cerebral Palsy": {
    "zh-CN": "脑瘫", fr: "Paralysie cérébrale", es: "Parálisis cerebral",
    it: "Paralisi cerebrale", ja: "脳性まひ", ko: "뇌성마비",
    th: "สมองพิการ", vi: "Bại não",
  },
  "Chronic Pain": {
    "zh-CN": "慢性疼痛", fr: "Douleur chronique", es: "Dolor crónico",
    it: "Dolore cronico", ja: "慢性疼痛", ko: "만성 통증",
    th: "อาการปวดเรื้อรัง", vi: "Đau mạn tính",
  },
  "Gender-based Violence": {
    "zh-CN": "基于性别的暴力", fr: "Violence fondée sur le genre",
    es: "Violencia de género", it: "Violenza di genere", ja: "ジェンダーに基づく暴力",
    ko: "성별 기반 폭력", th: "ความรุนแรงด้วยเหตุแห่งเพศ", vi: "Bạo lực trên cơ sở giới",
  },
  "Health service improvement": {
    "zh-CN": "医疗服务改进", fr: "Amélioration des services de santé",
    es: "Mejora de los servicios de salud", it: "Miglioramento dei servizi sanitari",
    ja: "医療サービスの改善", ko: "보건 서비스 개선",
    th: "การปรับปรุงบริการสุขภาพ", vi: "Cải thiện dịch vụ y tế",
  },
  Homelessness: {
    "zh-CN": "无家可归", fr: "Sans-abrisme", es: "Personas sin hogar",
    it: "Senza dimora", ja: "ホームレス状態", ko: "노숙",
    th: "การไร้ที่อยู่อาศัย", vi: "Vô gia cư",
  },
  "Modern Slavery": {
    "zh-CN": "现代奴役", fr: "Esclavage moderne", es: "Esclavitud moderna",
    it: "Schiavitù moderna", ja: "現代奴隷", ko: "현대판 노예제",
    th: "การใช้แรงงานทาสสมัยใหม่", vi: "Nô lệ hiện đại",
  },
  "Motor Neuron Disease": {
    "zh-CN": "运动神经元病", fr: "Maladie du motoneurone",
    es: "Enfermedad de la neurona motora", it: "Malattia del motoneurone",
    ja: "運動ニューロン疾患", ko: "운동 신경원 질환",
    th: "โรคเซลล์ประสาทสั่งการ", vi: "Bệnh thần kinh vận động",
  },
  "Palliative Care": {
    "zh-CN": "姑息治疗", fr: "Soins palliatifs", es: "Cuidados paliativos",
    it: "Cure palliative", ja: "緩和ケア", ko: "완화 의료",
    th: "การดูแลแบบประคับประคอง", vi: "Chăm sóc giảm nhẹ",
  },
  "Postural Orthostatic Tachycardia Syndrome (POTS)": {
    "zh-CN": "体位性心动过速综合征（POTS）",
    fr: "Syndrome de tachycardie orthostatique posturale (POTS)",
    es: "Síndrome de taquicardia ortostática postural (POTS)",
    it: "Sindrome da tachicardia posturale ortostatica (POTS)",
    ja: "体位性頻脈症候群（POTS）", ko: "기립성 빈맥 증후군(POTS)",
    th: "กลุ่มอาการหัวใจเต้นเร็วเมื่อเปลี่ยนท่า (POTS)",
    vi: "Hội chứng nhịp tim nhanh tư thế đứng (POTS)",
  },
  Regional: {
    "zh-CN": "地区性", fr: "Régional", es: "Regional", it: "Regionale", ja: "地方",
    ko: "지역", th: "ระดับภูมิภาค", vi: "Khu vực",
  },
  "Rural and Remote": {
    "zh-CN": "乡村及偏远地区", fr: "Zones rurales et isolées",
    es: "Zonas rurales y remotas", it: "Aree rurali e remote",
    ja: "農村・遠隔地域", ko: "농촌 및 외딴 지역",
    th: "ชนบทและพื้นที่ห่างไกล", vi: "Nông thôn và vùng sâu vùng xa",
  },
  "Spinal Cord Injury": {
    "zh-CN": "脊髓损伤", fr: "Lésion de la moelle épinière",
    es: "Lesión de la médula espinal", it: "Lesione del midollo spinale",
    ja: "脊髄損傷", ko: "척수 손상", th: "การบาดเจ็บไขสันหลัง", vi: "Tổn thương tủy sống",
  },
  Suicide: {
    "zh-CN": "自杀", fr: "Suicide", es: "Suicidio", it: "Suicidio", ja: "自殺",
    ko: "자살", th: "การฆ่าตัวตาย", vi: "Tự tử",
  },
  "Victims of Violence": {
    "zh-CN": "暴力受害者", fr: "Victimes de violence", es: "Víctimas de violencia",
    it: "Vittime di violenza", ja: "暴力被害者", ko: "폭력 피해자",
    th: "ผู้เสียหายจากความรุนแรง", vi: "Nạn nhân của bạo lực",
  },
};

export function translateOption(language: Language, value: string): string {
  if (language === "en") return value;
  return glossaries[language]?.[value] ?? subcategories[value]?.[language] ?? value;
}

const levelWords: Partial<Record<Language, string>> = {
  "zh-CN": "等级", fr: "Niveau", es: "Nivel", it: "Livello",
  ja: "レベル", ko: "수준", th: "ระดับ", vi: "Cấp độ",
};

export function translateLevelLabel(language: Language, label: string): string {
  if (language === "en") return label;
  const numbers = label.match(/\d+(?:-\d+)?/)?.[0];
  return numbers ? `${levelWords[language] ?? "Level"} ${numbers}` : label;
}
