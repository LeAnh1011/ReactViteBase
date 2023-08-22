import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Profile } from "core/models/Profile";

const initialState: Profile = {};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateAll: (state, action: PayloadAction<Profile>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { updateAll } = profileSlice.actions;
export default profileSlice.reducer;
