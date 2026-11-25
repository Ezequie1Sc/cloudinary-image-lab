export interface AppEnvironment {
  readonly production: boolean;

  readonly cloudinary: {
    readonly cloudName: string;
    readonly secure: boolean;
    readonly deliveryBaseUrl: string;
  };
}
