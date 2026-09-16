import type { Link } from "@/links/domain/models/link.ts";
import type { ShortCode } from "@/links/domain/models/short-code.ts";

export interface Links {
  save(link: Link): Promise<void>;
  byCode(code: ShortCode): Promise<Link | undefined>;
  exists(code: ShortCode): Promise<boolean>;
}
