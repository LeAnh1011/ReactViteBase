import { Profile } from "core/models/Profile";

export enum PROFILE_ENUM {
  UPDATE,
}

export interface ProfileAction {
  type: PROFILE_ENUM;
  payload: Profile;
}
