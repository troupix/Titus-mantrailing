import { MantrailingForm } from "./MantrailingForm";
import { HikingForm } from "./HikingForm";
import { TrailCategory } from "../types/trail";

export const activityFormRegistry: Record<TrailCategory, React.FC<any>> = {
  mantrailing: MantrailingForm,
  hiking: HikingForm,
};
