import { createContext } from "react";
import type { SignalRService } from "core/services/common-services/signalr-service";
import { AppState } from "core/services/service-types";

export const SignalRContext = createContext<SignalRService>(null);
export const AppStateContext = createContext<AppState>(null);
