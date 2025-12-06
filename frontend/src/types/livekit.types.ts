export interface LiveKitToken {
  token: string;
  url: string;
}

export interface LiveKitTokenResponse {
  success: boolean;
  data: LiveKitToken;
}