/** Base of every typed error raised by the links context. No transport concerns here. */
export abstract class LinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidShortCode extends LinkError {
  constructor(readonly value: string) {
    super(`"${value}" is not a valid short code`);
  }
}

export class InvalidTargetUrl extends LinkError {
  constructor(readonly value: string) {
    super("url must be an absolute http:// or https:// URL");
  }
}

export class InvalidExpiration extends LinkError {
  constructor(reason: string) {
    super(`expiresAt ${reason}`);
  }
}

export class ShortCodeExhausted extends LinkError {
  constructor(attempts: number) {
    super(`could not allocate a free short code after ${attempts} attempts`);
  }
}

export class LinkNotFound extends LinkError {
  constructor(readonly code: string) {
    super(`link ${code} not found`);
  }
}

export class LinkExpired extends LinkError {
  constructor(readonly code: string) {
    super(`link ${code} has expired`);
  }
}
