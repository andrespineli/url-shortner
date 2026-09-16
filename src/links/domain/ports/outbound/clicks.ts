import type { Click } from "@/links/domain/models/click.ts";

export interface Clicks {
  record(click: Click): Promise<void>;
}
