// src/descriptions/wikiContent.ts
export type LanguageCode = 'en' | 'zh' | 'ja' | 'ko' | 'fr' | 'de' | 'ru';

export interface LocalizedField {
  en: string;
  zh?: string;
  ja?: string;
  ko?: string;
  fr?: string;
  de?: string;
  ru?: string;
}

export interface WikiArticle {
  id: string;
  category:
    | 'architecture'
    | 'getting-started'
    | 'environment'
    | 'configuration'
    | 'operations'
    | 'support'
    | 'formation';
  title: LocalizedField;
  summary: LocalizedField;
  tags: string[];
  body: Partial<Record<LanguageCode, string>>;
}

// language folder mapping
const LANG_PATHS: Record<LanguageCode, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  fr: 'fr_FR',
  de: 'de_DE',
  ru: 'ru_RU',
};

// Use import.meta.glob to preload all Markdown Files
const markdownFiles = import.meta.glob('@/assets/docs/**/*.md', { eager: true, query: '?raw', import: 'default' });

// Load Docs from local
const loadDocs = (basename: string): Partial<Record<LanguageCode, string>> => {
  const result: Partial<Record<LanguageCode, string>> = {};
  for (const [lang, folder] of Object.entries(LANG_PATHS) as [LanguageCode, string][]) {
    const path = `/assets/docs/${folder}/${basename}.md`;
    const matched = Object.keys(markdownFiles).find((k) => k.endsWith(path));
    if (matched) {
      result[lang] = markdownFiles[matched] as unknown as string;
    }
  }
  return result;
};

// 创建文章
const article = (
  id: WikiArticle['id'],
  category: WikiArticle['category'],
  title: LocalizedField,
  summary: LocalizedField,
  tags: string[],
  basename: string
): WikiArticle => ({
  id,
  category,
  title,
  summary,
  tags,
  body: loadDocs(basename),
});

// ----------------------
// Passage List
// ----------------------
export const wikiArticles: WikiArticle[] = [
  article(
    'frontend-development',
    'architecture',
    {
      en: "Frontend Development Guide",
      zh: "前端开发指南",
      ja: "フロントエンド開発ガイド",
      ko: "프론트엔드 개발 가이드",
      fr: "Guide de développement Frontend",
      ru: "Руководство по фронтенд-разработке",
      de: "Leitfaden für die Frontend-Entwicklung"
    },
    {
      en: 'System-level overview covering application shell, module responsibilities, state management, and extensibility checklist.',
      zh: '从系统层面梳理应用外壳、模块职责、状态管理与扩展检查要点。',
      ja: 'アプリケーションシェル、モジュールの責務、状態管理、拡張性チェックリストを網羅したシステムレベルの概要。',
      ko: '애플리케이션 셸, 모듈 책임, 상태 관리 및 확장성 체크리스트를 다루는 시스템 수준 개요.',
      fr: "Vue d'ensemble au niveau du système couvrant le shell de l'application, les responsabilités des modules, la gestion de l'état et la liste de contrôle d'extensibilité.",
      ru: 'Обзор на системном уровне, охватывающий оболочку приложения, обязанности модулей, управление состоянием и контрольный список расширяемости.',
      de: 'Systemübergreifende Übersicht über die Anwendungs-Shell, Modulverantwortlichkeiten, Zustandsverwaltung und eine Checkliste für die Erweiterbarkeit.',
    },
    ['architecture', 'state-management', 'websocket'],
    'Frontend Development Guide'
  ),
  article(
    'internal-settings',
    'getting-started',
    {
      en: 'Internal Settings (First Use)',
      zh: '首次使用必看：游戏内设置说明',
      ja: 'ゲーム内設定（初回必須）',
      ko: '게임 내 설정 (최초 사용 필독)',
      fr: 'Paramètres internes (Première utilisation)',
      ru: 'Внутренние настройки (обязательно при первом использовании)',
      de: 'Interne Einstellungen (Erste Verwendung)',
    },
    {
      en: 'Mandatory in-game configuration checklist that must be completed before running automation.',
      zh: '首次运行自动化脚本前必须完成的游戏内设置清单。',
      ja: '自動化を実行する前に完了する必要がある、必須のゲーム内設定チェックリスト。',
      ko: '자동화를 실행하기 전에 완료해야 하는 필수 게임 내 설정 체크리스트.',
      fr: "Liste de contrôle de configuration obligatoire en jeu à compléter avant d'exécuter l'automatisation.",
      ru: 'Обязательный список настроек в игре, который необходимо выполнить перед запуском автоматизации.',
      de: 'Obligatorische Checkliste für die Konfiguration im Spiel, die vor dem Ausführen der Automatisierung abgeschlossen werden muss.',
    },
    ['setup', 'prerequisite'],
    'Internal settings in BlueArchive game (first-use must read)'
  ),
  article(
    'emulator-adb',
    'environment',
    {
      en: 'Common Emulator ADB Addresses',
      zh: '常用模拟器 ADB 地址',
      ja: '一般的なエミュレータのADBアドレス',
      ko: '일반적인 에뮬레이터 ADB 주소',
      fr: 'Adresses ADB courantes des émulateurs',
      ru: 'Распространенные ADB-адреса эмуляторов',
      de: 'Gängige Emulator-ADB-Adressen',
    },
    {
      en: 'Reference table for ADB host/port values across popular Android emulators.',
      zh: '各类常见安卓模拟器的 ADB 主机与端口速查表。',
      ja: '一般的なAndroidエミュレータにおけるADBホスト/ポート値の参照表。',
      ko: '널리 사용되는 안드로이드 에뮬레이터의 ADB 호스트/포트 값 참조 테이블.',
      fr: 'Tableau de référence pour les valeurs d\'hôte/port ADB des émulateurs Android populaires.',
  ru: 'Справочная таблица значений хоста/порта ADB для популярных эмуляторов Android.',
  de: 'Referenztabelle für ADB-Host-/Port-Werte für gängige Android-Emulatoren.',
},
['environment', 'adb', 'emulator'],
  'Commonly used emulator adb address'
),
article(
  'auto-clear-mainline',
  'configuration',
  {
    en: 'Auto Clear Mainline Plot',
    zh: '主线剧情自动清理设置',
    ja: 'メインストーリーの自動クリア設定',
    ko: '메인 스토리 자동 클리어 설정',
    fr: 'Configuration de la suppression automatique de la trame principale',
    ru: 'Настройки автоматической зачистки основной сюжетной линии',
    de: 'Einstellungen für das automatische Abschließen der Hauptstory',
  },
  {
    en: 'Detailed walkthrough for configuring automated main story clearing.',
    zh: '主线剧情自动清理的完整配置步骤与注意事项。',
    ja: 'メインストーリーの自動クリアを設定するための詳細な手順。',
    ko: '자동화된 메인 스토리 클리어를 구성하기 위한 상세한 안내.',
    fr: "Guide détaillé pour configurer le nettoyage automatique de l'histoire principale.",
    ru: 'Подробное руководство по настройке автоматической зачистки основной сюжетной линии.',
    de: 'Detaillierte Anleitung zur Konfiguration des automatischen Abschließens der Hauptstory.',
  },
  ['configuration', 'story', 'automation'],
  'Auto clear mainline plot settings'
),
  article(
    'normal-graphs',
    'configuration',
    {
      en: 'Normal Stage Strategy',
      zh: '普通图说明',
      ja: 'ノーマルステージ攻略',
      ko: '일반 스테이지 공략',
      fr: 'Stratégie pour les niveaux normaux',
      ru: 'Стратегия для обычных этапов',
      de: 'Strategie für normale Stufen',
    },
    {
      en: 'Stage-specific notes, rewards, and recommended tactics for normal campaigns.',
      zh: '普通关卡的掉落、策略与推荐配置说明。',
      ja: 'ノーマルキャンペーンのステージごとの注記、報酬、推奨戦術。',
      ko: '일반 캠페인에 대한 스테이지별 참고 사항, 보상 및 권장 전술.',
      fr: 'Notes spécifiques aux niveaux, récompenses et tactiques recommandées pour les campagnes normales.',
      ru: 'Примечания к этапам, награды и рекомендуемые тактики для обычных кампаний.',
      de: 'Stufenspezifische Hinweise, Belohnungen und empfohlene Taktiken für normale Kampagnen.',
    },
    ['stages', 'normal', 'strategy'],
    'Description of normal graphs'
  ),
  article(
    'difficult-chart',
    'configuration',
    {
      en: 'Hard Stage Configuration',
      zh: '困难图配置说明',
      ja: 'ハードステージの設定',
      ko: '하드 스테이지 설정',
      fr: 'Configuration des niveaux difficiles',
      ru: 'Настройка сложных этапов',
      de: 'Konfiguration für schwere Stufen',
    },
    {
      en: 'How to prepare auto-farming for hard stages, including team composition and retry rules.',
      zh: '困难图自动扫荡的准备流程、编队搭配与重试策略。',
      ja: 'チーム編成やリトライのルールなど、ハードステージの自動周回の準備方法。',
      ko: '팀 구성 및 재시도 규칙을 포함하여 하드 스테이지 자동 파밍을 준비하는 방법.',
      fr: "Comment préparer le farm automatique pour les niveaux difficiles, y compris la composition de l'équipe et les règles de nouvelle tentative.",
      ru: 'Как подготовиться к авто-фарму на сложных этапах, включая состав команды и правила повторных попыток.',
      de: 'Wie man das Auto-Farming für schwere Stufen vorbereitet, einschließlich Teamzusammenstellung und Wiederholungsregeln.',
    },
    ['stages', 'hard', 'strategy'],
    'Difficult Chart Configuration Description'
  ),
  article(
    'activity-sweep',
    'operations',
    {
      en: 'Activity Sweep Guide',
      zh: '活动扫荡填写指南',
      ja: 'イベント掃討ガイド',
      ko: '이벤트 소탕 가이드',
      fr: "Guide de balayage d'activité",
      ru: 'Руководство по зачистке событий',
      de: 'Leitfaden zur Aktivitäts-Säuberung',
    },
    {
      en: 'Templates for configuring event sweep parameters and monitoring resource usage.',
      zh: '活动扫荡参数填写示例与资源消耗监控建议。',
      ja: 'イベント掃討パラメータの設定テンプレートとリソース使用状況の監視。',
      ko: '이벤트 소탕 매개변수 구성 및 자원 사용량 모니터링을 위한 템플릿.',
      fr: "Modèles pour configurer les paramètres de balayage d'événements et surveiller l'utilisation des ressources.",
      ru: 'Шаблоны для настройки параметров зачистки событий и мониторинга использования ресурсов.',
      de: 'Vorlagen zur Konfiguration von Event-Sweep-Parametern und zur Überwachung des Ressourcenverbrauchs.',
    },
    ['events', 'operations'],
    'Guide for activity sweep fill in'
  ),
  article(
    'normal-sweep',
    'operations',
    {
      en: 'Normal Sweep Scanning',
      zh: '普通扫荡扫描说明',
      ja: '通常掃討スキャン',
      ko: '일반 소탕 스캔',
      fr: 'Balayage normal',
      ru: 'Сканирование при обычной зачистке',
      de: 'Normales Scannen beim Sweepen',
    },
    {
      en: 'Explains the scanning workflow and optimisation points for daily sweeps.',
      zh: '日常扫荡的扫描流程及优化要点。',
      ja: '日常掃討のスキャンワークフローと最適化ポイントについて説明します。',
      ko: '일일 소탕을 위한 스캔 워크플로우 및 최적화 지점을 설명합니다.',
      fr: "Explique le flux de travail de numérisation et les points d'optimisation pour les balayages quotidiens.",
      ru: 'Объясняет рабочий процесс сканирования и точки оптимизации для ежедневных зачисток.',
      de: 'Erklärt den Scan-Workflow und die Optimierungspunkte für tägliche Sweeps.',
    },
    ['daily', 'operations'],
    'Normal Sweeping Scanning Description'
  ),
  article(
    'reporting-guidelines',
    'support',
    {
      en: 'Issue Reporting Guidelines',
      zh: '问题反馈指南',
      ja: '問題報告ガイドライン',
      ko: '문제 보고 가이드라인',
      fr: 'Directives pour le signalement de problèmes',
      ru: 'Руководство по сообщению о проблемах',
      de: 'Richtlinien für die Meldung von Problemen',
    },
    {
      en: 'Defines the canonical process for logging defects, required evidence, and escalation path.',
      zh: '规范问题反馈流程、所需证据及升级路径。',
      ja: '不具合の記録、必要な証拠、エスカレーションパスに関する正式なプロセスを定義します。',
      ko: '결함 기록, 필요한 증거 및 에스컬레이션 경로에 대한 표준 프로세스를 정의합니다.',
      fr: 'Définit le processus canonique pour consigner les défauts, les preuves requises et le chemin d\'escalade.',
      ru: 'Определяет канонический процесс регистрации дефектов, необходимые доказательства и путь эскалации.',
      de: 'Definiert den kanonischen Prozess zur Protokollierung von Fehlern, die erforderlichen Nachweise und den Eskalationspfad.',
    },
    ['support', 'qa'],
    'reporting guidelines on issues (important)'
  ),
  article(
    'scheduling-guide',
    'configuration',
    {
      en: 'Scheduling Configuration Guide',
      zh: '调度配置填写指南',
      ja: 'スケジュール設定ガイド',
      ko: '스케줄링 설정 가이드',
      fr: 'Guide de configuration de la planification',
      ru: 'Руководство по настройке планировщика',
      de: 'Anleitung zur Planungskonfiguration',
    },
    {
      en: 'Explains every scheduling field and how they map to automation behaviour.',
      zh: '逐项说明调度配置字段及其在自动化中的行为。',
      ja: 'すべてのスケジュールフィールドと、それらが自動化の動作にどのようにマッピングされるかを説明します。',
      ko: '모든 스케줄링 필드와 그것들이 자동화 동작에 어떻게 매핑되는지 설명합니다.',
      fr: "Explique chaque champ de planification et comment ils correspondent au comportement de l'automatisation.",
      ru: 'Объясняет каждое поле планирования и как они соотносятся с поведением автоматизации.',
      de: 'Erklärt jedes Planungsfeld und wie es sich auf das Automatisierungsverhalten auswirkt.',
    },
    ['scheduler', 'configuration'],
    'Scheduling Configuration Filling Guide'
  ),
  article(
    'task-force-attributes',
    'formation',
    {
      en: 'Task Force Attributes by Region',
      zh: '各区域所需编队属性',
      ja: '地域別の部隊属性',
      ko: '지역별 부대 속성',
      fr: 'Attributs des équipes par région',
      ru: 'Атрибуты отрядов по регионам',
      de: 'Team-Attribute nach Region',
    },
    {
      en: 'Attribute requirements and recommended squads per combat region.',
      zh: '各作战区域的编队属性需求与推荐队伍。',
      ja: '各戦闘地域ごとの属性要件と推奨部隊。',
      ko: '각 전투 지역별 속성 요구 사항 및 추천 분대.',
      fr: 'Exigences d\'attributs et escouades recommandées par région de combat.',
      ru: 'Требования к атрибутам и рекомендуемые отряды для каждого боевого региона.',
      de: 'Attributanforderungen und empfohlene Trupps pro Kampfregion.',
    },
    ['formation', 'strategy'],
    'Task force attributes required by region'
  ),
];

// ----------------------
// Tool Functions
// ----------------------
export const mapLanguage = (language: string): LanguageCode => {
  if (language.startsWith('zh')) return 'zh';
  if (language.startsWith('ja')) return 'ja';
  if (language.startsWith('ko')) return 'ko';
  if (language.startsWith('fr')) return 'fr';
  if (language.startsWith('de')) return 'de';
  if (language.startsWith('ru')) return 'ru';
  return 'en';
};

export const getLocalizedField = (field: LocalizedField, lang: LanguageCode): string => {
  return field[lang] ?? field.en;
};
