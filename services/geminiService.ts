/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Client } from "@gradio/client";

const HF_TOKEN = process.env.HF_TOKEN || "";

async function urlToBlob(url: string): Promise<Blob> {
  if (url.startsWith('data:')) {
    const arr = url.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
  const res = await fetch(url);
  return await res.blob();
}

/**
 * Prepara a imagem do modelo a partir da foto do usuario.
 * No provador virtual, o modelo base e a propria foto enviada,
 * retornada instantaneamente e sem limites de cota.
 */
export const generateModelImage = async (userImage: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(userImage);
  });
};

/**
 * Aplica a peca de roupa escolhida sobre a foto da pessoa usando o IDM-VTON na Hugging Face.
 */
export const generateVirtualTryOnImage = async (modelImageUrl: string, garmentImage: File): Promise<string> => {
  try {
    const modelBlob = await urlToBlob(modelImageUrl);
    
    // Conecta ao modelo de Virtual Try-On IDM-VTON com a chave gratuita
    const client = await Client.connect("yisol/IDM-VTON", {
      hf_token: HF_TOKEN as `hf_${string}`
    });

    const result = await client.predict("/tryon", {
      dict: {
        background: modelBlob,
        layers: [],
        composite: null
      },
      garm_img: garmentImage,
      garment_des: "clothing garment",
      is_checked: true,
      is_checked_crop: true,
      denoise_steps: 30,
      seed: 42
    });

    const output = result.data as any[];
    if (!output || !output[0]) {
      throw new Error("O modelo nao retornou uma imagem valida.");
    }

    const firstItem = output[0];
    const finalUrl = typeof firstItem === 'string' ? firstItem : (firstItem.url || firstItem.path);
    if (!finalUrl) {
      throw new Error("Nao foi possivel obter a URL da imagem gerada.");
    }
    return finalUrl;
  } catch (error: any) {
    console.error("Erro no Provador Hugging Face:", error);
    const msg = error?.message || String(error);
    if (msg.includes("GPU") || msg.includes("quota") || msg.includes("busy") || msg.includes("queue")) {
      throw new Error("O servidor gratuito da Hugging Face esta ocupado no momento. Aguarde alguns segundos e tente novamente!");
    }
    throw new Error(`Falha ao vestir a peca: ${msg}`);
  }
};

/**
 * Mantem a pose gerada na visualizacao.
 */
export const generatePoseVariation = async (tryOnImageUrl: string, _poseInstruction: string): Promise<string> => {
  return tryOnImageUrl;
};
