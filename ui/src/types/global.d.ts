declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const value: string;
  export default value;
}

declare module "xlsx-style";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: unknown) => void;
  }
}
