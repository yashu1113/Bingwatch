interface NetworkInformation {
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly saveData: boolean;
  readonly type: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
}

interface Navigator {
  readonly connection?: NetworkInformation;
}