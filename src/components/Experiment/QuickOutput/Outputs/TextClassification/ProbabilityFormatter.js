export default function formatProbability(probability) {
    let result = `${(probability * 100).toFixed()}%`;
  
    if (result === "0%") return "<1%";
  
    return result;
  }