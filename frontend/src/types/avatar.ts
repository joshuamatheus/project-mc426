// Tipos para o sistema de avatares
export interface AvatarChoice {
  avatar: string;
  trainer_type: string;
}

export interface AvatarOption {
  emoji: string;
  name: string;
  description: string;
}

export const AVAILABLE_AVATARS: AvatarOption[] = [
  { emoji: "🎓", name: "Graduando", description: "Para estudantes de graduação" },
  { emoji: "👨‍🎓", name: "Formando", description: "Pronto para se formar" },
  { emoji: "👩‍🔬", name: "Pesquisador", description: "Focado em pesquisa científica" },
  { emoji: "👨‍💻", name: "Tech", description: "Apaixonado por tecnologia" },
  { emoji: "📚", name: "Estudioso", description: "Sempre com os livros" },
  { emoji: "🦄", name: "Unicórnio", description: "Representando a Unicamp!" },
  { emoji: "⚗️", name: "Cientista", description: "Laboratórios e experimentos" },
  { emoji: "🏛️", name: "Acadêmico", description: "Tradição universitária" },
];