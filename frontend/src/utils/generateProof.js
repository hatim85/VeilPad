import { Noir } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";

export const generateProof = async (objectParams, circuitPath) => {
  try {
    console.log("Generating proof with params: ", objectParams);
    
    // Load the circuit
    const circuit = await fetch(circuitPath).then(res => res.json());
    const backend = new BarretenbergBackend(circuit);
    const noir = new Noir(circuit, backend);
    
    // Generate proof using Noir
    const { proof, publicInputs } = await noir.generateProof(objectParams);

    console.log("proof: ", proof);
    console.log("publicInputs: ", publicInputs);

    return { proof, publicSignals: publicInputs };
  } catch (error) {
    console.error("Error in generateProof:", error);
  }
};

export const generateProofWhitelist = async (
  userAddress,
  path,
  pathElements,
  root
) => {
  const circuitPath = "/circuits/whitelist.json";

  for (var i = pathElements.length; i < 32; i++) {
    pathElements.push("0x0");
  }

  for (var i = path.length; i < 32; i++) {
    path.push(0);
  }

  const params = {
    merkle_root: "0x" + root,
    path: path,
    path_elements: pathElements,
    user_address: userAddress,
  };

  return generateProof(params, circuitPath);
};

export const generateProofContribution = async (
  userAddress,
  path,
  pathElements,
  root,
  contribution
) => {
  try {
    const circuitPath = "/circuits/contribution.json";

    for (var i = pathElements.length; i < 32; i++) {
      pathElements.push("0x0");
    }

    for (var i = path.length; i < 32; i++) {
      path.push(0);
    }

    const params = {
      merkle_root: "0x" + root,
      path: path,
      path_elements: pathElements,
      user_address: userAddress,
      contribution: contribution,
    };

    return generateProof(params, circuitPath);
  } catch (error) {
    console.error("Error in generateProofContribution:", error);
  }
};
