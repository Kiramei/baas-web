import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useApp} from "@/contexts/AppContext";
import type {AppSettings} from "@/lib/types.ts";
import {Dialog, DialogPanel, DialogTitle} from "@headlessui/react";
import {X} from "lucide-react";
import StudentSelectorModal from "@/components/StudentSelectorModal.tsx";

// 学生结构
type Student = {
  CN_name: string;
  Global_name: string;
  JP_name: string;
  CN_implementation: boolean;
  Global_implementation: boolean;
  JP_implementation: boolean;
};

// props 定义
type CafeConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
  studentNames?: Student[]; // 外部传入学生列表
};

// 草稿定义
type Draft = {
  cafe_collect_reward: boolean;
  cafe_use_invitation: boolean;
  cafe_exchange_student: boolean;
  cafe_duplicate_invite: boolean;
  cafe_has_no2_cafe: boolean;
  cafe_pat_rounds: number | "";
  pat_style: string;
  cafe_invite1_criterion: string;
  cafe_invite2_criterion: string;
  cafe_invite1_starred_position: string;
  favorStudent1: string[];
  favorStudent2: string[];
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/* ---------- Modal 组件 ---------- */
// const StudentSelectorModal: React.FC<{
//   isOpen: boolean;
//   onClose: () => void;
//   allStudents: Student[];
//   selected: string[];
//   onChange: (list: string[]) => void;
//   lang?: "CN" | "JP" | "Global";
// }> = ({isOpen, onClose, allStudents, selected, onChange, lang = "JP"}) => {
//   const [query, setQuery] = useState("");
//
//   const displayName = (s: Student) => {
//     if (lang === "CN") return s.CN_name;
//     if (lang === "Global") return s.Global_name;
//     return s.JP_name;
//   };
//
//   const filtered = useMemo(() => {
//     return allStudents.filter((s) =>
//       displayName(s).toLowerCase().includes(query.toLowerCase())
//     );
//   }, [query, allStudents, lang]);
//
//   const toggleStudent = (name: string) => {
//     if (selected.includes(name)) {
//       onChange(selected.filter((n) => n !== name));
//     } else {
//       onChange([...selected, name]);
//     }
//   };
//
//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       <div className="fixed inset-0 bg-black/30" aria-hidden="true"/>
//       <div className="fixed inset-0 flex items-center justify-center">
//         <DialogPanel className="w-full max-w-3xl rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg">
//           <div className="flex justify-between items-center mb-4">
//             <DialogTitle className="text-lg font-semibold">
//               选择学生
//             </DialogTitle>
//             <button onClick={onClose}>
//               <X className="w-5 h-5 text-slate-500"/>
//             </button>
//           </div>
//
//           <input
//             type="text"
//             placeholder="搜索学生..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="w-full mb-4 px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
//           />
//
//           <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
//             {filtered.map((s) => {
//               const name = displayName(s);
//               const active = selected.includes(name);
//               return (
//                 <button
//                   key={name}
//                   onClick={() => toggleStudent(name)}
//                   className={`px-3 py-1 rounded-full text-sm border transition ${
//                     active
//                       ? "bg-primary-600 text-white border-primary-600"
//                       : "bg-slate-100 dark:bg-slate-700 border-slate-300"
//                   }`}
//                 >
//                   {name}
//                 </button>
//               );
//             })}
//           </div>
//         </DialogPanel>
//       </div>
//     </Dialog>
//   );
// };

const __studentNames__: Student[] = [
  {
    "CN_name": "日和(泳装)",
    "CN_implementation": false,
    "Global_name": "Hiyori (Swimsuit)",
    "Global_implementation": false,
    "JP_name": "ヒヨリ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "纱织(泳装)",
    "CN_implementation": false,
    "Global_name": "Saori (Swimsuit)",
    "Global_implementation": false,
    "JP_name": "サオリ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "亚津子(泳装)",
    "CN_implementation": false,
    "Global_name": "Atsuko (Swimsuit)",
    "Global_implementation": false,
    "JP_name": "アツコ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "白子＊恐怖",
    "CN_implementation": false,
    "Global_name": "Shiroko Terror",
    "Global_implementation": false,
    "JP_name": "シロコ＊テラー",
    "JP_implementation": true
  },
  {
    "CN_name": "星野(临战)",
    "CN_implementation": false,
    "Global_name": "Hoshino (Battle)",
    "Global_implementation": false,
    "JP_name": "ホシノ(臨戦)",
    "JP_implementation": true
  },
  {
    "CN_name": "萌绘(泳装)",
    "CN_implementation": false,
    "Global_name": "Moe (Swimsuit)",
    "Global_implementation": false,
    "JP_name": "モエ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "桐乃(泳装)",
    "CN_implementation": false,
    "Global_name": "Kirino (Swimsuit)",
    "Global_implementation": false,
    "JP_name": "キリノ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "吹雪(泳装)",
    "CN_implementation": false,
    "Global_name": "Fubuki (Swimsuit)",
    "Global_implementation": false,
    "JP_name": "フブキ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "叶渚(泳装)",
    "CN_implementation": false,
    "Global_name": "Kanna (Swimsuit)",
    "Global_implementation": false,
    "JP_name": "カンナ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "芹香(泳装)",
    "CN_implementation": false,
    "Global_name": "Serika (Swimsuit)",
    "Global_implementation": false,
    "JP_name": "セリカ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "绿(女仆)",
    "CN_implementation": false,
    "Global_name": "Midori (Maid)",
    "Global_implementation": false,
    "JP_name": "ミドリ(メイド)",
    "JP_implementation": true
  },
  {
    "CN_name": "桃井(女仆)",
    "CN_implementation": false,
    "Global_name": "Momoi (Maid)",
    "Global_implementation": false,
    "JP_name": "モモイ(メイド)",
    "JP_implementation": true
  },
  {
    "CN_name": "绮罗罗",
    "CN_implementation": false,
    "Global_name": "Kirara",
    "Global_implementation": false,
    "JP_name": "キララ",
    "JP_implementation": true
  },
  {
    "CN_name": "爱莉(乐队)",
    "CN_implementation": false,
    "Global_name": "Airi (Band)",
    "Global_implementation": false,
    "JP_name": "アイリ(バンド)",
    "JP_implementation": true
  },
  {
    "CN_name": "好美(乐队)",
    "CN_implementation": false,
    "Global_name": "Yoshimi (Band)",
    "Global_implementation": false,
    "JP_name": "ヨシミ(バンド)",
    "JP_implementation": true
  },
  {
    "CN_name": "和纱(乐队)",
    "CN_implementation": false,
    "Global_name": "Kazusa (Band)",
    "Global_implementation": false,
    "JP_name": "カズサ(バンド)",
    "JP_implementation": true
  },
  {
    "CN_name": "椿(导游)",
    "CN_implementation": false,
    "Global_name": "Tsubaki (Guide)",
    "Global_implementation": false,
    "JP_name": "ツバキ(ガイド)",
    "JP_implementation": true
  },
  {
    "CN_name": "海香",
    "CN_implementation": false,
    "Global_name": "Umika",
    "Global_implementation": false,
    "JP_name": "ウミカ",
    "JP_implementation": true
  },
  {
    "CN_name": "明里(正月)",
    "CN_implementation": false,
    "Global_name": "Akari (New Year)",
    "Global_implementation": false,
    "JP_name": "アカリ(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "阿露(礼服)",
    "CN_implementation": false,
    "Global_name": "Aru (Dress)",
    "Global_implementation": false,
    "JP_name": "アル(ドレス)",
    "JP_implementation": true
  },
  {
    "CN_name": "佳代子(礼服)",
    "CN_implementation": false,
    "Global_name": "Kayoko (Dress)",
    "Global_implementation": false,
    "JP_name": "カヨコ(ドレス)",
    "JP_implementation": true
  },
  {
    "CN_name": "日奈(礼服)",
    "CN_implementation": false,
    "Global_name": "Hina (Dress)",
    "Global_implementation": true,
    "JP_name": "ヒナ(ドレス)",
    "JP_implementation": true
  },
  {
    "CN_name": "真琴",
    "CN_implementation": false,
    "Global_name": "Makoto",
    "Global_implementation": true,
    "JP_name": "マコト",
    "JP_implementation": true
  },
  {
    "CN_name": "伊吹",
    "CN_implementation": false,
    "Global_name": "Ibuki",
    "Global_implementation": true,
    "JP_name": "イブキ",
    "JP_implementation": true
  },
  {
    "CN_name": "亚子(礼服)",
    "CN_implementation": false,
    "Global_name": "Ako (Dress)",
    "Global_implementation": true,
    "JP_name": "アコ(ドレス)",
    "JP_implementation": true
  },
  {
    "CN_name": "晴(露营)",
    "CN_implementation": false,
    "Global_name": "Hare (Camp)",
    "Global_implementation": true,
    "JP_name": "ハレ(キャンプ)",
    "JP_implementation": true
  },
  {
    "CN_name": "小玉(露营)",
    "CN_implementation": false,
    "Global_name": "Kotama (Camp)",
    "Global_implementation": true,
    "JP_name": "コタマ(キャンプ)",
    "JP_implementation": true
  },
  {
    "CN_name": "艾米(泳装)",
    "CN_implementation": false,
    "Global_name": "Eimi (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "エイミ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "桔梗",
    "CN_implementation": false,
    "Global_name": "Kikyou",
    "Global_implementation": true,
    "JP_name": "キキョウ",
    "JP_implementation": true
  },
  {
    "CN_name": "莲华",
    "CN_implementation": false,
    "Global_name": "Renge",
    "Global_implementation": true,
    "JP_name": "レンゲ",
    "JP_implementation": true
  },
  {
    "CN_name": "紫草",
    "CN_implementation": false,
    "Global_name": "Yukari",
    "Global_implementation": true,
    "JP_name": "ユカリ",
    "JP_implementation": true
  },
  {
    "CN_name": "佐天泪子",
    "CN_implementation": false,
    "Global_name": "Saten Ruiko",
    "Global_implementation": true,
    "JP_name": "佐天涙子",
    "JP_implementation": true
  },
  {
    "CN_name": "食蜂操祈",
    "CN_implementation": false,
    "Global_name": "Shokuhou Misaki",
    "Global_implementation": true,
    "JP_name": "食蜂操祈",
    "JP_implementation": true
  },
  {
    "CN_name": "御坂美琴",
    "CN_implementation": false,
    "Global_name": "Misaka Mikoto",
    "Global_implementation": true,
    "JP_name": "御坂美琴",
    "JP_implementation": true
  },
  {
    "CN_name": "时雨(温泉)",
    "CN_implementation": false,
    "Global_name": "Shigure (Hot Spring)",
    "Global_implementation": true,
    "JP_name": "シグレ(温泉)",
    "JP_implementation": true
  },
  {
    "CN_name": "霞",
    "CN_implementation": false,
    "Global_name": "Kasumi",
    "Global_implementation": true,
    "JP_name": "カスミ",
    "JP_implementation": true
  },
  {
    "CN_name": "一花",
    "CN_implementation": false,
    "Global_name": "Ichika",
    "Global_implementation": true,
    "JP_name": "イチカ",
    "JP_implementation": true
  },
  {
    "CN_name": "晴奈(运动服)",
    "CN_implementation": false,
    "Global_name": "Haruna (Track)",
    "Global_implementation": true,
    "JP_name": "ハルナ(体操服)",
    "JP_implementation": true
  },
  {
    "CN_name": "琴里(应援团)",
    "CN_implementation": false,
    "Global_name": "Kotori (Cheer Squad)",
    "Global_implementation": true,
    "JP_name": "コトリ(応援団)",
    "JP_implementation": true
  },
  {
    "CN_name": "红叶",
    "CN_implementation": false,
    "Global_name": "Momiji",
    "Global_implementation": true,
    "JP_name": "モミジ",
    "JP_implementation": true
  },
  {
    "CN_name": "芽留",
    "CN_implementation": false,
    "Global_name": "Meru",
    "Global_implementation": true,
    "JP_name": "メル",
    "JP_implementation": true
  },
  {
    "CN_name": "三森(泳装)",
    "CN_implementation": false,
    "Global_name": "Mimori (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ミモリ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "花子(泳装)",
    "CN_implementation": false,
    "Global_name": "Hanako (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ハナコ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "小春(泳装)",
    "CN_implementation": false,
    "Global_name": "Koharu (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "コハル(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "日向(泳装)",
    "CN_implementation": false,
    "Global_name": "Hinata (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ヒナタ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "忧(泳装)",
    "CN_implementation": false,
    "Global_name": "Ui (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ウイ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "白子(泳装)",
    "CN_implementation": false,
    "Global_name": "Shiroko (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "シロコ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "美游(泳装)",
    "CN_implementation": false,
    "Global_name": "Miyu (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ミユ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "咲(泳装)",
    "CN_implementation": false,
    "Global_name": "Saki (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "サキ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "宫子(泳装)",
    "CN_implementation": false,
    "Global_name": "Miyako (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ミヤコ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "实里",
    "CN_implementation": false,
    "Global_name": "Minori",
    "Global_implementation": true,
    "JP_name": "ミノリ",
    "JP_implementation": true
  },
  {
    "CN_name": "弥奈",
    "CN_implementation": false,
    "Global_name": "Mina",
    "Global_implementation": true,
    "JP_name": "ミナ",
    "JP_implementation": true
  },
  {
    "CN_name": "瑠美",
    "CN_implementation": false,
    "Global_name": "Rumi",
    "Global_implementation": true,
    "JP_name": "ルミ",
    "JP_implementation": true
  },
  {
    "CN_name": "玲纱",
    "CN_implementation": true,
    "Global_name": "Reisa",
    "Global_implementation": true,
    "JP_name": "レイサ",
    "JP_implementation": true
  },
  {
    "CN_name": "柚子(女仆)",
    "CN_implementation": true,
    "Global_name": "Yuzu (Maid)",
    "Global_implementation": true,
    "JP_name": "ユズ(メイド)",
    "JP_implementation": true
  },
  {
    "CN_name": "时(邦妮)",
    "CN_implementation": true,
    "Global_name": "Toki (Bunny)",
    "Global_implementation": true,
    "JP_name": "トキ(バニーガール)",
    "JP_implementation": true
  },
  {
    "CN_name": "爱丽丝(女仆)",
    "CN_implementation": true,
    "Global_name": "Aris (Maid)",
    "Global_implementation": true,
    "JP_name": "アリス(メイド)",
    "JP_implementation": true
  },
  {
    "CN_name": "果穗",
    "CN_implementation": false,
    "Global_name": "Kaho",
    "Global_implementation": true,
    "JP_name": "カホ",
    "JP_implementation": true
  },
  {
    "CN_name": "春香(新年)",
    "CN_implementation": true,
    "Global_name": "Haruka (New Year)",
    "Global_implementation": true,
    "JP_name": "ハルカ(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "佳代子(新年)",
    "CN_implementation": true,
    "Global_name": "Kayoko (New Year)",
    "Global_implementation": true,
    "JP_name": "カヨコ(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "小雪",
    "CN_implementation": true,
    "Global_name": "Koyuki",
    "Global_implementation": true,
    "JP_name": "コユキ",
    "JP_implementation": true
  },
  {
    "CN_name": "渚",
    "CN_implementation": true,
    "Global_name": "Nagisa",
    "Global_implementation": true,
    "JP_name": "ナギサ",
    "JP_implementation": true
  },
  {
    "CN_name": "时",
    "CN_implementation": true,
    "Global_name": "Toki",
    "Global_implementation": true,
    "JP_name": "トキ",
    "JP_implementation": true
  },
  {
    "CN_name": "樱子",
    "CN_implementation": true,
    "Global_name": "Sakurako",
    "Global_implementation": true,
    "JP_name": "サクラコ",
    "JP_implementation": true
  },
  {
    "CN_name": "康娜",
    "CN_implementation": true,
    "Global_name": "Kanna",
    "Global_implementation": true,
    "JP_name": "カンナ",
    "JP_implementation": true
  },
  {
    "CN_name": "惠",
    "CN_implementation": true,
    "Global_name": "Megu",
    "Global_implementation": true,
    "JP_name": "メグ",
    "JP_implementation": true
  },
  {
    "CN_name": "未花",
    "CN_implementation": true,
    "Global_name": "Mika",
    "Global_implementation": true,
    "JP_name": "ミカ",
    "JP_implementation": true
  },
  {
    "CN_name": "美祢",
    "CN_implementation": true,
    "Global_name": "Mine",
    "Global_implementation": true,
    "JP_name": "ミネ",
    "JP_implementation": true
  },
  {
    "CN_name": "纯子(新年)",
    "CN_implementation": true,
    "Global_name": "Junko (New Year)",
    "Global_implementation": true,
    "JP_name": "ジュンコ(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "风香(新年)",
    "CN_implementation": true,
    "Global_name": "Fuuka (New Year)",
    "Global_implementation": true,
    "JP_name": "フウカ(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "晴奈(新年)",
    "CN_implementation": true,
    "Global_name": "Haruna (New Year)",
    "Global_implementation": true,
    "JP_name": "ハルナ(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "花江(圣诞)",
    "CN_implementation": true,
    "Global_name": "Hanae (Christmas)",
    "Global_implementation": true,
    "JP_name": "ハナエ(クリスマス)",
    "JP_implementation": true
  },
  {
    "CN_name": "芹娜(圣诞)",
    "CN_implementation": true,
    "Global_name": "Serina (Christmas)",
    "Global_implementation": true,
    "JP_name": "セリナ(クリスマス)",
    "JP_implementation": true
  },
  {
    "CN_name": "时雨",
    "CN_implementation": false,
    "Global_name": "Shigure",
    "Global_implementation": true,
    "JP_name": "シグレ",
    "JP_implementation": true
  },
  {
    "CN_name": "日鞠",
    "CN_implementation": false,
    "Global_name": "Himari",
    "Global_implementation": true,
    "JP_name": "ヒマリ",
    "JP_implementation": true
  },
  {
    "CN_name": "莲见(体操服)",
    "CN_implementation": true,
    "Global_name": "Hasumi (Track)",
    "Global_implementation": true,
    "JP_name": "ハスミ(体操服)",
    "JP_implementation": true
  },
  {
    "CN_name": "玛丽(体操服)",
    "CN_implementation": true,
    "Global_name": "Mari (Track)",
    "Global_implementation": true,
    "JP_name": "マリー(体操服)",
    "JP_implementation": true
  },
  {
    "CN_name": "优香(体操服)",
    "CN_implementation": true,
    "Global_name": "Yuuka (Track)",
    "Global_implementation": true,
    "JP_name": "ユウカ(体操服)",
    "JP_implementation": true
  },
  {
    "CN_name": "茜(邦妮)",
    "CN_implementation": true,
    "Global_name": "Akane (Bunny)",
    "Global_implementation": true,
    "JP_name": "アカネ(バニーガール)",
    "JP_implementation": true
  },
  {
    "CN_name": "响(应援团)",
    "CN_implementation": true,
    "Global_name": "Hibiki (Cheer Squad)",
    "Global_implementation": true,
    "JP_name": "ヒビキ(応援団)",
    "JP_implementation": true
  },
  {
    "CN_name": "诺亚",
    "CN_implementation": true,
    "Global_name": "Noa",
    "Global_implementation": true,
    "JP_name": "ノア",
    "JP_implementation": true
  },
  {
    "CN_name": "歌原(应援团)",
    "CN_implementation": true,
    "Global_name": "Utaha (Cheer Squad)",
    "Global_implementation": true,
    "JP_name": "ウタハ(応援団)",
    "JP_implementation": true
  },
  {
    "CN_name": "心奈",
    "CN_implementation": false,
    "Global_name": "Kokona",
    "Global_implementation": true,
    "JP_name": "ココナ",
    "JP_implementation": true
  },
  {
    "CN_name": "和纱",
    "CN_implementation": true,
    "Global_name": "Kazusa",
    "Global_implementation": true,
    "JP_name": "カズサ",
    "JP_implementation": true
  },
  {
    "CN_name": "萌绘",
    "CN_implementation": true,
    "Global_name": "Moe",
    "Global_implementation": true,
    "JP_name": "モエ",
    "JP_implementation": true
  },
  {
    "CN_name": "纱织",
    "CN_implementation": true,
    "Global_name": "Saori",
    "Global_implementation": true,
    "JP_name": "サオリ",
    "JP_implementation": true
  },
  {
    "CN_name": "千世(泳装)",
    "CN_implementation": true,
    "Global_name": "Chise (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "チセ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "泉奈(泳装)",
    "CN_implementation": true,
    "Global_name": "Izuna (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "イズナ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "静子(泳装)",
    "CN_implementation": true,
    "Global_name": "Shizuko (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "シズコ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "星野(泳装)",
    "CN_implementation": true,
    "Global_name": "Hoshino (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ホシノ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "绫音(泳装)",
    "CN_implementation": true,
    "Global_name": "Ayane (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "アヤネ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "野宫(泳装)",
    "CN_implementation": true,
    "Global_name": "Nonomi (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ノノミ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "若藻(泳装)",
    "CN_implementation": true,
    "Global_name": "Wakamo (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ワカモ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "亚津子",
    "CN_implementation": true,
    "Global_name": "Atsuko",
    "Global_implementation": true,
    "JP_name": "アツコ",
    "JP_implementation": true
  },
  {
    "CN_name": "日和",
    "CN_implementation": true,
    "Global_name": "Hiyori",
    "Global_implementation": true,
    "JP_name": "ヒヨリ",
    "JP_implementation": true
  },
  {
    "CN_name": "美咲",
    "CN_implementation": true,
    "Global_name": "Misaki",
    "Global_implementation": true,
    "JP_name": "ミサキ",
    "JP_implementation": true
  },
  {
    "CN_name": "月咏",
    "CN_implementation": true,
    "Global_name": "Tsukuyo",
    "Global_implementation": true,
    "JP_name": "ツクヨ",
    "JP_implementation": true
  },
  {
    "CN_name": "满",
    "CN_implementation": true,
    "Global_name": "Michiru",
    "Global_implementation": true,
    "JP_name": "ミチル",
    "JP_implementation": true
  },
  {
    "CN_name": "伊吕波",
    "CN_implementation": true,
    "Global_name": "Iroha",
    "Global_implementation": true,
    "JP_name": "イロハ",
    "JP_implementation": true
  },
  {
    "CN_name": "枫",
    "CN_implementation": true,
    "Global_name": "Kaede",
    "Global_implementation": true,
    "JP_name": "カエデ",
    "JP_implementation": true
  },
  {
    "CN_name": "美游",
    "CN_implementation": true,
    "Global_name": "Miyu",
    "Global_implementation": true,
    "JP_name": "ミユ",
    "JP_implementation": true
  },
  {
    "CN_name": "咲",
    "CN_implementation": true,
    "Global_name": "Saki",
    "Global_implementation": true,
    "JP_name": "サキ",
    "JP_implementation": true
  },
  {
    "CN_name": "宫子",
    "CN_implementation": true,
    "Global_name": "Miyako",
    "Global_implementation": true,
    "JP_name": "ミヤコ",
    "JP_implementation": true
  },
  {
    "CN_name": "真里奈",
    "CN_implementation": true,
    "Global_name": "Marina",
    "Global_implementation": true,
    "JP_name": "マリナ",
    "JP_implementation": true
  },
  {
    "CN_name": "日向",
    "CN_implementation": true,
    "Global_name": "Hinata",
    "Global_implementation": true,
    "JP_name": "ヒナタ",
    "JP_implementation": true
  },
  {
    "CN_name": "忧",
    "CN_implementation": true,
    "Global_name": "Ui",
    "Global_implementation": true,
    "JP_name": "ウイ",
    "JP_implementation": true
  },
  {
    "CN_name": "三森",
    "CN_implementation": true,
    "Global_name": "Mimori",
    "Global_implementation": true,
    "JP_name": "ミモリ",
    "JP_implementation": true
  },
  {
    "CN_name": "千寻",
    "CN_implementation": true,
    "Global_name": "Chihiro",
    "Global_implementation": true,
    "JP_name": "チヒロ",
    "JP_implementation": true
  },
  {
    "CN_name": "濑名",
    "CN_implementation": true,
    "Global_name": "Sena",
    "Global_implementation": true,
    "JP_name": "セナ",
    "JP_implementation": true
  },
  {
    "CN_name": "吹雪",
    "CN_implementation": true,
    "Global_name": "Fubuki",
    "Global_implementation": true,
    "JP_name": "フブキ",
    "JP_implementation": true
  },
  {
    "CN_name": "若藻",
    "CN_implementation": true,
    "Global_name": "Wakamo",
    "Global_implementation": true,
    "JP_name": "ワカモ",
    "JP_implementation": true
  },
  {
    "CN_name": "芹香(新年)",
    "CN_implementation": true,
    "Global_name": "Serika (New Year)",
    "Global_implementation": true,
    "JP_name": "セリカ(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "睦月(新年)",
    "CN_implementation": true,
    "Global_name": "Mutsuki (New Year)",
    "Global_implementation": true,
    "JP_name": "ムツキ(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "爱露(新年)",
    "CN_implementation": true,
    "Global_name": "Aru (New Year)",
    "Global_implementation": true,
    "JP_name": "アル(正月)",
    "JP_implementation": true
  },
  {
    "CN_name": "和香(温泉)",
    "CN_implementation": true,
    "Global_name": "Nodoka (Hot Spring)",
    "Global_implementation": true,
    "JP_name": "ノドカ(温泉)",
    "JP_implementation": true
  },
  {
    "CN_name": "巴",
    "CN_implementation": true,
    "Global_name": "Tomoe",
    "Global_implementation": true,
    "JP_name": "トモエ",
    "JP_implementation": true
  },
  {
    "CN_name": "千夏(温泉)",
    "CN_implementation": true,
    "Global_name": "Chinatsu (Hot Spring)",
    "Global_implementation": true,
    "JP_name": "チナツ(温泉)",
    "JP_implementation": true
  },
  {
    "CN_name": "切里诺(温泉)",
    "CN_implementation": true,
    "Global_name": "Cherino (Hot Spring)",
    "Global_implementation": true,
    "JP_name": "チェリノ(温泉)",
    "JP_implementation": true
  },
  {
    "CN_name": "亚子",
    "CN_implementation": true,
    "Global_name": "Ako",
    "Global_implementation": true,
    "JP_name": "アコ",
    "JP_implementation": true
  },
  {
    "CN_name": "初音未来",
    "CN_implementation": true,
    "Global_name": "Hatsune Miku",
    "Global_implementation": true,
    "JP_name": "初音ミク",
    "JP_implementation": true
  },
  {
    "CN_name": "玛丽",
    "CN_implementation": true,
    "Global_name": "Mari",
    "Global_implementation": true,
    "JP_name": "マリー",
    "JP_implementation": true
  },
  {
    "CN_name": "夏",
    "CN_implementation": true,
    "Global_name": "Natsu",
    "Global_implementation": true,
    "JP_name": "ナツ",
    "JP_implementation": true
  },
  {
    "CN_name": "明日奈(邦妮)",
    "CN_implementation": true,
    "Global_name": "Asuna (Bunny)",
    "Global_implementation": true,
    "JP_name": "アスナ(バニーガール)",
    "JP_implementation": true
  },
  {
    "CN_name": "花凛(邦妮)",
    "CN_implementation": true,
    "Global_name": "Karin (Bunny)",
    "Global_implementation": true,
    "JP_name": "カリン(バニーガール)",
    "JP_implementation": true
  },
  {
    "CN_name": "妮露(邦妮)",
    "CN_implementation": true,
    "Global_name": "Neru (Bunny)",
    "Global_implementation": true,
    "JP_name": "ネル(バニーガール)",
    "JP_implementation": true
  },
  {
    "CN_name": "纱绫(便服)",
    "CN_implementation": true,
    "Global_name": "Saya (Casual)",
    "Global_implementation": true,
    "JP_name": "サヤ(私服)",
    "JP_implementation": true
  },
  {
    "CN_name": "桐乃",
    "CN_implementation": true,
    "Global_name": "Kirino",
    "Global_implementation": true,
    "JP_name": "キリノ",
    "JP_implementation": true
  },
  {
    "CN_name": "瞬(小)",
    "CN_implementation": true,
    "Global_name": "Shun (Small)",
    "Global_implementation": true,
    "JP_name": "シュン(幼女)",
    "JP_implementation": true
  },
  {
    "CN_name": "白子(骑行)",
    "CN_implementation": true,
    "Global_name": "Shiroko (Cycling)",
    "Global_implementation": true,
    "JP_name": "シロコ(ライディング)",
    "JP_implementation": true
  },
  {
    "CN_name": "泉(泳装)",
    "CN_implementation": true,
    "Global_name": "Izumi (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "イズミ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "伊织(泳装)",
    "CN_implementation": true,
    "Global_name": "Iori (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "イオリ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "日奈(泳装)",
    "CN_implementation": true,
    "Global_name": "Hina (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ヒナ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "日富美(泳装)",
    "CN_implementation": true,
    "Global_name": "Hifumi (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ヒフミ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "鹤城(泳装)",
    "CN_implementation": true,
    "Global_name": "Tsurugi (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "ツルギ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "真白(泳装)",
    "CN_implementation": true,
    "Global_name": "Mashiro (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "マシロ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "梓(泳装)",
    "CN_implementation": true,
    "Global_name": "Azusa (Swimsuit)",
    "Global_implementation": true,
    "JP_name": "アズサ(水着)",
    "JP_implementation": true
  },
  {
    "CN_name": "小春",
    "CN_implementation": true,
    "Global_name": "Koharu",
    "Global_implementation": true,
    "JP_name": "コハル",
    "JP_implementation": true
  },
  {
    "CN_name": "花子",
    "CN_implementation": true,
    "Global_name": "Hanako",
    "Global_implementation": true,
    "JP_name": "ハナコ",
    "JP_implementation": true
  },
  {
    "CN_name": "梓",
    "CN_implementation": true,
    "Global_name": "Azusa",
    "Global_implementation": true,
    "JP_name": "アズサ",
    "JP_implementation": true
  },
  {
    "CN_name": "柚子",
    "CN_implementation": true,
    "Global_name": "Yuzu",
    "Global_implementation": true,
    "JP_name": "ユズ",
    "JP_implementation": true
  },
  {
    "CN_name": "和香",
    "CN_implementation": true,
    "Global_name": "Nodoka",
    "Global_implementation": true,
    "JP_name": "ノドカ",
    "JP_implementation": true
  },
  {
    "CN_name": "切里诺",
    "CN_implementation": true,
    "Global_name": "Cherino",
    "Global_implementation": true,
    "JP_name": "チェリノ",
    "JP_implementation": true
  },
  {
    "CN_name": "桃",
    "CN_implementation": true,
    "Global_name": "Momoi",
    "Global_implementation": true,
    "JP_name": "モモイ",
    "JP_implementation": true
  },
  {
    "CN_name": "绿",
    "CN_implementation": true,
    "Global_name": "Midori",
    "Global_implementation": true,
    "JP_name": "ミドリ",
    "JP_implementation": true
  },
  {
    "CN_name": "爱丽丝",
    "CN_implementation": true,
    "Global_name": "Aris",
    "Global_implementation": true,
    "JP_name": "アリス",
    "JP_implementation": true
  },
  {
    "CN_name": "静子",
    "CN_implementation": true,
    "Global_name": "Shizuko",
    "Global_implementation": true,
    "JP_name": "シズコ",
    "JP_implementation": true
  },
  {
    "CN_name": "泉奈",
    "CN_implementation": true,
    "Global_name": "Izuna",
    "Global_implementation": true,
    "JP_name": "イズナ",
    "JP_implementation": true
  },
  {
    "CN_name": "真白",
    "CN_implementation": true,
    "Global_name": "Mashiro",
    "Global_implementation": true,
    "JP_name": "マシロ",
    "JP_implementation": true
  },
  {
    "CN_name": "好美",
    "CN_implementation": true,
    "Global_name": "Yoshimi",
    "Global_implementation": true,
    "JP_name": "ヨシミ",
    "JP_implementation": true
  },
  {
    "CN_name": "志美子",
    "CN_implementation": true,
    "Global_name": "Shimiko",
    "Global_implementation": true,
    "JP_name": "シミコ",
    "JP_implementation": true
  },
  {
    "CN_name": "芹娜",
    "CN_implementation": true,
    "Global_name": "Serina",
    "Global_implementation": true,
    "JP_name": "セリナ",
    "JP_implementation": true
  },
  {
    "CN_name": "朱莉",
    "CN_implementation": true,
    "Global_name": "Juri",
    "Global_implementation": true,
    "JP_name": "ジュリ",
    "JP_implementation": true
  },
  {
    "CN_name": "小玉",
    "CN_implementation": true,
    "Global_name": "Kotama",
    "Global_implementation": true,
    "JP_name": "コタマ",
    "JP_implementation": true
  },
  {
    "CN_name": "千夏",
    "CN_implementation": true,
    "Global_name": "Chinatsu",
    "Global_implementation": true,
    "JP_name": "チナツ",
    "JP_implementation": true
  },
  {
    "CN_name": "绫音",
    "CN_implementation": true,
    "Global_name": "Ayane",
    "Global_implementation": true,
    "JP_name": "アヤネ",
    "JP_implementation": true
  },
  {
    "CN_name": "歌原",
    "CN_implementation": true,
    "Global_name": "Utaha",
    "Global_implementation": true,
    "JP_name": "ウタハ",
    "JP_implementation": true
  },
  {
    "CN_name": "晴",
    "CN_implementation": true,
    "Global_name": "Hare",
    "Global_implementation": true,
    "JP_name": "ハレ",
    "JP_implementation": true
  },
  {
    "CN_name": "花江",
    "CN_implementation": true,
    "Global_name": "Hanae",
    "Global_implementation": true,
    "JP_name": "ハナエ",
    "JP_implementation": true
  },
  {
    "CN_name": "风香",
    "CN_implementation": true,
    "Global_name": "Fuuka",
    "Global_implementation": true,
    "JP_name": "フウカ",
    "JP_implementation": true
  },
  {
    "CN_name": "爱理",
    "CN_implementation": true,
    "Global_name": "Airi",
    "Global_implementation": true,
    "JP_name": "アイリ",
    "JP_implementation": true
  },
  {
    "CN_name": "纱绫",
    "CN_implementation": true,
    "Global_name": "Saya",
    "Global_implementation": true,
    "JP_name": "サヤ",
    "JP_implementation": true
  },
  {
    "CN_name": "花凛",
    "CN_implementation": true,
    "Global_name": "Karin",
    "Global_implementation": true,
    "JP_name": "カリン",
    "JP_implementation": true
  },
  {
    "CN_name": "响",
    "CN_implementation": true,
    "Global_name": "Hibiki",
    "Global_implementation": true,
    "JP_name": "ヒビキ",
    "JP_implementation": true
  },
  {
    "CN_name": "菲娜",
    "CN_implementation": true,
    "Global_name": "Pina",
    "Global_implementation": true,
    "JP_name": "フィーナ",
    "JP_implementation": true
  },
  {
    "CN_name": "铃美",
    "CN_implementation": true,
    "Global_name": "Suzumi",
    "Global_implementation": true,
    "JP_name": "スズミ",
    "JP_implementation": true
  },
  {
    "CN_name": "琴里",
    "CN_implementation": true,
    "Global_name": "Kotori",
    "Global_implementation": true,
    "JP_name": "コトリ",
    "JP_implementation": true
  },
  {
    "CN_name": "明日奈",
    "CN_implementation": true,
    "Global_name": "Asuna",
    "Global_implementation": true,
    "JP_name": "アスナ",
    "JP_implementation": true
  },
  {
    "CN_name": "春香",
    "CN_implementation": true,
    "Global_name": "Haruka",
    "Global_implementation": true,
    "JP_name": "ハルカ",
    "JP_implementation": true
  },
  {
    "CN_name": "优香",
    "CN_implementation": true,
    "Global_name": "Yuuka",
    "Global_implementation": true,
    "JP_name": "ユウカ",
    "JP_implementation": true
  },
  {
    "CN_name": "椿",
    "CN_implementation": true,
    "Global_name": "Tsubaki",
    "Global_implementation": true,
    "JP_name": "ツバキ",
    "JP_implementation": true
  },
  {
    "CN_name": "芹香",
    "CN_implementation": true,
    "Global_name": "Serika",
    "Global_implementation": true,
    "JP_name": "セリカ",
    "JP_implementation": true
  },
  {
    "CN_name": "纯子",
    "CN_implementation": true,
    "Global_name": "Junko",
    "Global_implementation": true,
    "JP_name": "ジュンコ",
    "JP_implementation": true
  },
  {
    "CN_name": "睦月",
    "CN_implementation": true,
    "Global_name": "Mutsuki",
    "Global_implementation": true,
    "JP_name": "ムツキ",
    "JP_implementation": true
  },
  {
    "CN_name": "佳代子",
    "CN_implementation": true,
    "Global_name": "Kayoko",
    "Global_implementation": true,
    "JP_name": "カヨコ",
    "JP_implementation": true
  },
  {
    "CN_name": "野宫",
    "CN_implementation": true,
    "Global_name": "Nonomi",
    "Global_implementation": true,
    "JP_name": "ノノミ",
    "JP_implementation": true
  },
  {
    "CN_name": "莲见",
    "CN_implementation": true,
    "Global_name": "Hasumi",
    "Global_implementation": true,
    "JP_name": "ハスミ",
    "JP_implementation": true
  },
  {
    "CN_name": "明里",
    "CN_implementation": true,
    "Global_name": "Akari",
    "Global_implementation": true,
    "JP_name": "アカリ",
    "JP_implementation": true
  },
  {
    "CN_name": "千世",
    "CN_implementation": true,
    "Global_name": "Chise",
    "Global_implementation": true,
    "JP_name": "チセ",
    "JP_implementation": true
  },
  {
    "CN_name": "茜",
    "CN_implementation": true,
    "Global_name": "Akane",
    "Global_implementation": true,
    "JP_name": "アカネ",
    "JP_implementation": true
  },
  {
    "CN_name": "鹤城",
    "CN_implementation": true,
    "Global_name": "Tsurugi",
    "Global_implementation": true,
    "JP_name": "ツルギ",
    "JP_implementation": true
  },
  {
    "CN_name": "堇",
    "CN_implementation": true,
    "Global_name": "Sumire",
    "Global_implementation": true,
    "JP_name": "スミレ",
    "JP_implementation": true
  },
  {
    "CN_name": "瞬",
    "CN_implementation": true,
    "Global_name": "Shun",
    "Global_implementation": true,
    "JP_name": "シュン",
    "JP_implementation": true
  },
  {
    "CN_name": "白子",
    "CN_implementation": true,
    "Global_name": "Shiroko",
    "Global_implementation": true,
    "JP_name": "シロコ",
    "JP_implementation": true
  },
  {
    "CN_name": "泉",
    "CN_implementation": true,
    "Global_name": "Izumi",
    "Global_implementation": true,
    "JP_name": "イズミ",
    "JP_implementation": true
  },
  {
    "CN_name": "妮露",
    "CN_implementation": true,
    "Global_name": "Neru",
    "Global_implementation": true,
    "JP_name": "ネル",
    "JP_implementation": true
  },
  {
    "CN_name": "真纪",
    "CN_implementation": true,
    "Global_name": "Maki",
    "Global_implementation": true,
    "JP_name": "マキ",
    "JP_implementation": true
  },
  {
    "CN_name": "伊织",
    "CN_implementation": true,
    "Global_name": "Iori",
    "Global_implementation": true,
    "JP_name": "イオリ",
    "JP_implementation": true
  },
  {
    "CN_name": "星野",
    "CN_implementation": true,
    "Global_name": "Hoshino",
    "Global_implementation": true,
    "JP_name": "ホシノ",
    "JP_implementation": true
  },
  {
    "CN_name": "日奈",
    "CN_implementation": true,
    "Global_name": "Hina",
    "Global_implementation": true,
    "JP_name": "ヒナ",
    "JP_implementation": true
  },
  {
    "CN_name": "日富美",
    "CN_implementation": true,
    "Global_name": "Hifumi",
    "Global_implementation": true,
    "JP_name": "ヒフミ",
    "JP_implementation": true
  },
  {
    "CN_name": "晴奈",
    "CN_implementation": true,
    "Global_name": "Haruna",
    "Global_implementation": true,
    "JP_name": "ハルナ",
    "JP_implementation": true
  },
  {
    "CN_name": "艾米",
    "CN_implementation": true,
    "Global_name": "Eimi",
    "Global_implementation": true,
    "JP_name": "エイミ",
    "JP_implementation": true
  },
  {
    "CN_name": "爱露",
    "CN_implementation": true,
    "Global_name": "Aru",
    "Global_implementation": true,
    "JP_name": "アル",
    "JP_implementation": true
  }]


/* ---------- 主组件 ---------- */
const CafeConfig: React.FC<CafeConfigProps> = ({
                                                 onClose,
                                                 profileId,
                                                 settings,
                                                 onChange,
                                                 studentNames = __studentNames__,
                                               }) => {
  const {t} = useTranslation();
  const {activeProfile, updateProfile} = useApp();

  // 外部设置
  const ext = useMemo(() => {
    const s = settings ?? activeProfile?.settings ?? {};
    return {
      cafe_collect_reward: s.cafe_collect_reward ?? false,
      cafe_use_invitation: s.cafe_use_invitation ?? true,
      cafe_exchange_student: s.cafe_exchange_student ?? true,
      cafe_duplicate_invite: s.cafe_duplicate_invite ?? false,
      cafe_has_no2_cafe: s.cafe_has_no2_cafe ?? false,
      cafe_pat_rounds: s.cafe_pat_rounds ?? 5,
      pat_style: s.pat_style ?? "普通",
      cafe_invite1_criterion: s.cafe_invite1_criterion ?? "lowest_affection",
      cafe_invite2_criterion: s.cafe_invite2_criterion ?? "lowest_affection",
      cafe_invite1_starred_position: String(
        s.cafe_invite1_starred_position ?? "1"
      ),
      favorStudent1: s.favorStudent1 ?? [],
      favorStudent2: s.favorStudent2 ?? [],
    };
  }, [settings, activeProfile]);

  const [draft, setDraft] = useState<Draft>(ext);
  const [showSelector1, setShowSelector1] = useState(false);
  const [showSelector2, setShowSelector2] = useState(false);

  useEffect(() => setDraft(ext), [ext]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(ext);

  // 通用布尔
  const onBoolChange = (key: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({...d, [key]: e.target.checked}));

  // 数字输入
  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") return setDraft((d) => ({...d, cafe_pat_rounds: ""}));
    const n = Number(raw);
    if (Number.isFinite(n)) {
      setDraft((d) => ({...d, cafe_pat_rounds: clamp(Math.trunc(n), 4, 15)}));
    }
  };

  // 下拉
  const onSelectChange = (key: keyof Draft) =>
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setDraft((d) => ({...d, [key]: e.target.value}));

  // 保存
  const handleSave = async () => {
    const patch: Partial<AppSettings> = {};
    (Object.keys(draft) as (keyof AppSettings)[]).forEach((k) => {
      if (draft[k] !== ext[k]) {
        patch[k] = draft[k] as AppSettings[typeof k];
      }
    });

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    if (onChange) {
      await onChange(patch);
    } else if (activeProfile) {
      await updateProfile(activeProfile.id, {
        settings: {...activeProfile.settings, ...patch},
      });
    }
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* 基础开关 */}
      {[
        ["cafe_collect_reward", "cafe.collectReward"],
        ["cafe_use_invitation", "cafe.useInvitation"],
        ["cafe_exchange_student", "cafe.exchangeStudent"],
        ["cafe_duplicate_invite", "cafe.duplicateInvite"],
        ["cafe_has_no2_cafe", "cafe.hasNo2Cafe"],
      ].map(([key, label]) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
        >
          <label className="font-medium">{t(label)}</label>
          <input
            type="checkbox"
            checked={draft[key as keyof Draft] as boolean}
            onChange={onBoolChange(key as keyof Draft)}
          />
        </div>
      ))}

      {/* 摸头轮数 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t("cafe.patRounds")}</label>
        <input
          type="number"
          value={draft.cafe_pat_rounds}
          onChange={onNumberChange}
          min={4}
          max={15}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* 摸头方式 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t("cafe.patStyle")}</label>
        <select
          value={draft.pat_style}
          onChange={onSelectChange("pat_style")}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="普通">{t("cafe.patStyleNormal")}</option>
          <option value="拖动礼物">{t("cafe.patStyleDragGift")}</option>
        </select>
      </div>

      {/* 咖啡厅1 邀请模式 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">{t("cafe.invite1Mode")}</label>
        <select
          value={draft.cafe_invite1_criterion}
          onChange={onSelectChange("cafe_invite1_criterion")}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="lowest_affection">{t("cafe.lowestAffection")}</option>
          <option value="highest_affection">{t("cafe.highestAffection")}</option>
          <option value="starred">{t("cafe.starred")}</option>
          <option value="name">{t("cafe.byName")}</option>
        </select>
      </div>

      {/* 收藏学生序号 */}
      {draft.cafe_invite1_criterion === "starred" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">{t("cafe.starredPosition")}</label>
          <select
            value={draft.cafe_invite1_starred_position}
            onChange={onSelectChange("cafe_invite1_starred_position")}
            className="w-full px-3 py-2 border rounded-md"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 指定学生 (咖啡厅1) */}
      {draft.cafe_invite1_criterion === "name" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">咖啡厅1 指定学生</label>
          <div className="flex flex-wrap gap-2">
            {draft.favorStudent1.map((name) => (
              <span
                key={name}
                className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-full text-sm dark:bg-slate-700"
              >
                {name}
                <button
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      favorStudent1: d.favorStudent1.filter((n) => n !== name),
                    }))
                  }
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowSelector1(true)}
              className="px-3 py-1 text-sm border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {t('Add Student')}
            </button>
          </div>
        </div>
      )}

      {/* 咖啡厅2 邀请模式 */}
      {draft.cafe_has_no2_cafe && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">{t("cafe.invite2Mode")}</label>
          <select
            value={draft.cafe_invite2_criterion}
            onChange={onSelectChange("cafe_invite2_criterion")}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="lowest_affection">{t("cafe.lowestAffection")}</option>
            <option value="highest_affection">{t("cafe.highestAffection")}</option>
            <option value="starred">{t("cafe.starred")}</option>
            <option value="name">{t("cafe.byName")}</option>
          </select>
        </div>
      )}

      {/* 指定学生 (咖啡厅2) */}
      {draft.cafe_has_no2_cafe && draft.cafe_invite2_criterion === "name" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">咖啡厅2 指定学生</label>
          <div className="flex flex-wrap gap-2">
            {draft.favorStudent2.map((name) => (
              <span
                key={name}
                className="flex items-center gap-1 px-2 py-1 bg-slate-200 rounded-full text-sm"
              >
                {name}
                <button
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      favorStudent2: d.favorStudent2.filter((n) => n !== name),
                    }))
                  }
                >
                  <X className="w-3 h-3"/>
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowSelector2(true)}
              className="px-3 py-1 text-sm border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {t('Add Student')}
            </button>
          </div>
        </div>
      )}

      {/* Modal 集成 */}
      <StudentSelectorModal
        isOpen={showSelector1}
        onClose={() => setShowSelector1(false)}
        allStudents={studentNames}
        selected={draft.favorStudent1}
        onChange={(list) => setDraft((d) => ({...d, favorStudent1: list}))}
        lang="JP"
        mode="multiple"
      />
      <StudentSelectorModal
        isOpen={showSelector2}
        onClose={() => setShowSelector2(false)}
        allStudents={studentNames}
        selected={draft.favorStudent2}
        onChange={(list) => setDraft((d) => ({...d, favorStudent2: list}))}
        lang="JP"
        mode="multiple"
      />

      {/* 保存按钮 */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={!dirty || draft.cafe_pat_rounds === ""}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-60"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
};

export default CafeConfig;
