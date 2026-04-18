import { useContext } from "react";
import { InvestigationContext } from "./investigationContextObject";

export function useInvestigation() {
    const context = useContext(InvestigationContext);

    if (!context) {
        throw new Error(
            "useInvestigation must be used within InvestigationProvider",
        );
    }

    return context;
}
