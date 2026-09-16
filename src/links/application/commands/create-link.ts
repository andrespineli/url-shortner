export class CreateLink {
  constructor(
    readonly url: string,
    readonly expiresAt: string | null = null,
  ) {}
}
