import { createContext } from "react";
import type { AppState } from "core/services/common-services/authorization-service";
import type { SignalRService } from "core/services/common-services/signalr-service";

export const SignalRContext = createContext<SignalRService>(null);
export const AppStateContext = createContext<AppState>(null);
