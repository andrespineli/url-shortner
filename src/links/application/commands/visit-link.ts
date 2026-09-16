export class VisitLink {
  constructor(
    readonly code: string,
    readonly referrer: string | null,
    readonly userAgent: string | null,
    readonly ip: string | null,
  ) {}
}
