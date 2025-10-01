declare module 'zkverifyjs' {
  export const zkVerifySession: any;
  export const ZkVerifyEvents: any;
  export const Library: {
    barretenberg: string;
    snarkjs: string;
  };
  export const CurveType: {
    bn254: string;
    bn128: string;
  };
  
  // Noir/Barretenberg proof verification
  export function verifyProof(verificationKey: any, proof: any, inputs: any): boolean;
  export function generateProof(inputs: any, circuit: any): Promise<any>;
  export function generateVerificationKey(circuit: any): Promise<any>;
}
