// 你后续把这些函数改成真实 HTTP/WebSocket 调用；返回/入参类型可以按需细化
import {AppSettings} from "@/lib/types.ts";
import {DynamicConfig} from "@/lib/type.dynamic.ts";

export const DEFAULT_CONFIG: DynamicConfig = {
  ArenaComponentNumber: 0,
  ArenaLevelDiff: 0,
  CommonShopList: [],
  CommonShopRefreshTime: "",
  TacticalChallengeShopList: [],
  TacticalChallengeShopRefreshTime: "",
  _pass: undefined,
  activity_sweep_task_number: 0,
  activity_sweep_times: "",
  alreadyCreateTime: "",
  antiHarmony: false,
  ap: undefined,
  assetsVisibility: false,
  autostart: false,
  bannerVisibility: false,
  bounty_coin: undefined,
  cafe_reward_affection_pat_round: 0,
  cafe_reward_allow_duplicate_invite: false,
  cafe_reward_allow_exchange_student: false,
  cafe_reward_collect_hour_reward: false,
  cafe_reward_has_no2_cafe: false,
  cafe_reward_interaction_shot_delay: 0,
  cafe_reward_invite1_criterion: "",
  cafe_reward_invite1_starred_student_position: 0,
  cafe_reward_invite2_criterion: "",
  cafe_reward_invite2_starred_student_position: 0,
  cafe_reward_lowest_affection_first: false,
  cafe_reward_use_invitation_ticket: false,
  choose_team_method: "",
  clear_friend_white_list: [],
  control_method: "",
  createPriority_phase1: "",
  createPriority_phase2: "",
  createPriority_phase3: "",
  createTime: "",
  create_item_holding_quantity: undefined,
  create_phase: 0,
  create_phase_1_select_item_rule: "",
  create_phase_2_select_item_rule: "",
  create_phase_3_select_item_rule: "",
  creditpoints: undefined,
  drill_difficulty_list: [],
  drill_enable_sweep: false,
  drill_fight_formation_list: [],
  emulatorIsMultiInstance: false,
  emulatorMultiInstanceNumber: 0,
  emulator_wait_time: "",
  explore_hard_task_list: "",
  explore_normal_task_list: "",
  favorStudent1: [],
  favorStudent2: [],
  hardPriority: "",
  hotkey_run: "",
  last_refresh_config_time: "",
  lesson_each_region_object_priority: undefined,
  lesson_enableInviteFavorStudent: false,
  lesson_favorStudent: [],
  lesson_relationship_first: false,
  lesson_times: [],
  main_story_regions: "",
  mainlinePriority: "",
  manual_boss: false,
  maxArenaRefreshTimes: 0,
  multiEmulatorName: "",
  name: "",
  new_event_enable_state: "",
  patStyle: "",
  preset_team_attribute: undefined,
  program_address: "",
  purchase_arena_ticket_times: "",
  purchase_lesson_ticket_times: "",
  purchase_rewarded_task_ticket_times: "",
  purchase_scrimmage_ticket_times: "",
  push_after_completion: false,
  push_after_error: false,
  push_json: "",
  push_serverchan: "",
  pyroxene: undefined,
  rewarded_task_times: "",
  screenshot_interval: "",
  screenshot_method: "",
  scrimmage_times: "",
  side_team_attribute: undefined,
  special_task_times: "",
  tactical_challenge_coin: undefined,
  then: "",
  totalForceFightDifficulty: "",
  unfinished_hard_tasks: [],
  unfinished_normal_tasks: [],
  use_acceleration_ticket: false,
  server: 'CN',
  adbIP: '127.0.0.1',
  adbPort: '16384',
  open_emulator_stat: true
}

export interface ProfileDTO {
  id: string;
  name: string;
  server: string;
  settings: DynamicConfig;
}

export async function createProfile(payload: {
  name: string;
  server: string,
  settings: DynamicConfig
}): Promise<ProfileDTO> {
  // TODO: POST /api/profiles
  // 返回后端分配的 id
  return {id: crypto.randomUUID(), name: payload.name, server: payload.server, settings: payload.settings};
}
