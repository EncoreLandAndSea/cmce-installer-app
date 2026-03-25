// Stub for jsPDF's optional html2canvas dependency.
// This app uses jsPDF's direct drawing API only — html2canvas is not needed.
const html2canvas = () => Promise.resolve(document.createElement('canvas'));
export default html2canvas;
