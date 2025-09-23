import React from "react";
import type {AppSettings} from "@/lib/types.ts";

type TacticalConfigProps = {
  onClose: () => void;
  profileId?: string;
  settings?: Partial<AppSettings>;
  onChange?: (patch: Partial<AppSettings>) => Promise<void>;
};

interface TacticalState {
  hard_level: number;
}


const TacticalConfig: React.FC<TacticalConfigProps> = ({
                                                         onClose,
                                                         profileId,
                                                         settings,
                                                         onChange,
                                                       }) => {

  const [draft, setDraft] = React.useState<TacticalState>({
    hard_level: settings?.hard_level ?? 0,
  });

  return <div>Cafe Config Component</div>;
}

export default TacticalConfig;