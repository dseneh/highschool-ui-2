export const styleSheet = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-progress {
    from { width: 0%; }
    to { width: 100%; }
  }
  
  .animate-fade-up { animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
  .animate-progress { animation: slide-progress 5s linear forwards; }
`;
