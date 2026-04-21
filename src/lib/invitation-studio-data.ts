/**
 * @fileOverview Data definitions for the Invitation Studio Pro.
 * Includes premium textured themes with cultural 'Buta', symbols, and message presets.
 */

export const studioThemes = {
  nepaliTraditional: [
    { 
      id: 'shubha-vivaha-classic', 
      name: 'Shubha Vivaha Classic', 
      bg: 'linear-gradient(rgba(153, 0, 0, 0.95), rgba(153, 0, 0, 0.95)), url("https://www.transparenttextures.com/patterns/black-linen.png")', 
      accent: '#FFD700', 
      textColor: '#FFFFFF',
      border: '6px double #FFD700',
      shadow: '0 0 30px rgba(212, 175, 55, 0.4)'
    },
    { 
      id: 'dhaka-pattern', 
      name: 'Royal Dhaka Red', 
      bg: 'linear-gradient(rgba(139, 0, 0, 0.94), rgba(139, 0, 0, 0.94)), url("https://www.transparenttextures.com/patterns/p6.png")', 
      accent: '#FFD700', 
      textColor: '#FFFFFF',
      border: '4px double #FFD700',
      shadow: '0 0 20px rgba(255, 215, 0, 0.3)'
    },
    { 
      id: 'newari-heritage', 
      name: 'Intricate Newari', 
      bg: 'linear-gradient(rgba(88, 28, 12, 0.96), rgba(88, 28, 12, 0.96)), url("https://www.transparenttextures.com/patterns/black-linen.png")', 
      accent: '#FCD34D', 
      textColor: '#FDE68A',
      border: '6px groove #8B4513'
    },
    { 
      id: 'vintage-lokta', 
      name: 'Traditional Lokta', 
      bg: 'linear-gradient(rgba(234, 224, 213, 0.88), rgba(234, 224, 213, 0.88)), url("https://www.transparenttextures.com/patterns/handmade-paper.png")', 
      accent: '#8B4513', 
      textColor: '#2C1810',
      border: '2px solid #8B4513'
    },
    { 
      id: 'mithila-vibrant', 
      name: 'Mithila Folk Art', 
      bg: 'linear-gradient(rgba(255, 251, 235, 0.92), rgba(255, 251, 235, 0.92)), url("https://www.transparenttextures.com/patterns/natural-paper.png")', 
      accent: '#D97706', 
      textColor: '#78350F',
      border: '8px solid transparent',
      borderImage: 'url("https://i.imgur.com/JIe8MIX.png") 30 stretch'
    },
    { 
      id: 'temple-gold', 
      name: 'Patan Bronze', 
      bg: 'linear-gradient(rgba(74, 55, 1, 0.92), rgba(74, 55, 1, 0.92)), url("https://www.transparenttextures.com/patterns/dark-matter.png")', 
      accent: '#FFD700', 
      textColor: '#FFFFFF',
      border: '4px ridge #FFD700'
    },
  ],
  indianRegal: [
    { 
      id: 'marwari-heavy', 
      name: 'Royal Marwari', 
      bg: 'linear-gradient(rgba(74, 0, 0, 0.96), rgba(74, 0, 0, 0.96)), url("https://www.transparenttextures.com/patterns/damask-weave.png")', 
      accent: '#F1C40F', 
      textColor: '#FFFFFF',
      border: '5px double #F1C40F'
    },
    { 
      id: 'jaipur-silk', 
      name: 'Jaipur Pink Silk', 
      bg: 'linear-gradient(rgba(252, 231, 243, 0.93), rgba(252, 231, 243, 0.93)), url("https://www.transparenttextures.com/patterns/diagonal-striped-brick.png")', 
      accent: '#DB2777', 
      textColor: '#831843',
      border: '3px solid #DB2777'
    },
    { 
      id: 'mughal-emerald', 
      name: 'Mughal Emerald', 
      bg: 'linear-gradient(rgba(6, 78, 59, 0.96), rgba(6, 78, 59, 0.96)), url("https://www.transparenttextures.com/patterns/skulls.png")', 
      accent: '#FBBF24', 
      textColor: '#ECFDF5',
      border: '4px solid #FBBF24'
    },
    { 
      id: 'ivory-pearl', 
      name: 'Royal Ivory Pearl', 
      bg: 'linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url("https://www.transparenttextures.com/patterns/cream-paper.png")', 
      accent: '#B8860B', 
      textColor: '#422006',
      border: '2px solid #B8860B'
    },
  ],
  ceremonySpecific: [
    { id: 'luxury-midnight', name: 'Luxury Midnight', bg: 'linear-gradient(rgba(26, 26, 26, 0.97), rgba(26, 26, 26, 0.97)), url("https://www.transparenttextures.com/patterns/asfalt-dark.png")', accent: '#FFD700', textColor: '#FFFFFF', border: '1px solid #333' },
    { id: 'janai-saffron', name: 'Bratabandha Saffron', bg: 'linear-gradient(rgba(255, 247, 237, 0.93), rgba(255, 247, 237, 0.93)), url("https://www.transparenttextures.com/patterns/rice-paper.png")', accent: '#FF4500', textColor: '#9A3412', border: '3px solid #FF4500' },
    { id: 'baby-nursery', name: 'Nuworan Pastel', bg: 'linear-gradient(rgba(254, 252, 232, 0.92), rgba(254, 252, 232, 0.92)), url("https://www.transparenttextures.com/patterns/cloud.png")', accent: '#CA8A04', textColor: '#854D0E', border: '2px dashed #CA8A04' }
  ]
};

export const studioSymbols = [
  { id: 'ganesh-gold', name: 'Ganesha Gold', src: 'https://i.imgur.com/0U6WIqT.png', category: 'Religious' },
  { id: 'kalash-holy', name: 'Kalash Holy', src: 'https://i.imgur.com/MYaf8xi.png', category: 'Ceremony' },
  { id: 'doli-wedding', name: 'Wedding Doli', src: 'https://i.imgur.com/7igVXTK.png', category: 'Wedding' },
  { id: 'swastik-gold', name: 'Holy Swastik', src: 'https://i.imgur.com/cuhJHLh.png', category: 'Religious' },
  { id: 'om-divine', name: 'Om Divine', src: 'https://i.imgur.com/bD5g2Tn.png', category: 'Religious' },
  { id: 'royal-elephant', name: 'Royal Elephant', src: 'https://i.imgur.com/Brh6c60.png', category: 'Cultural' },
  { id: 'mandala-1', name: 'Intricate Mandala', src: 'https://i.imgur.com/JIe8MIX.png', category: 'Buta' },
  { id: 'gold-corner-1', name: 'Gold Corner 1', src: 'https://i.imgur.com/7eUMr3f.png', category: 'Decoration' },
  { id: 'gold-corner-2', name: 'Gold Corner 2', src: 'https://i.imgur.com/BFFBcpZ.png', category: 'Decoration' },
  { id: 'gold-frame-1', name: 'Gold Frame 1', src: 'https://i.imgur.com/CF3e3sc.png', category: 'Border' },
];

export const relationshipTitles = [
  "Pujaniya Bajey (पुजनीय बाजे)", 
  "Pujaniya Bajai (पुजनीय बजै)", 
  "Aadarniya Buwa (आदरणीय बुवा)", 
  "Aadarniya Aama (आदरणीय आमा)", 
  "Daju (दाजु)", 
  "Bhai (भाइ)", 
  "Didi (दिदी)", 
  "Bahini (बहिनी)", 
  "Mama (मामा)", 
  "Maiju (माइजू)", 
  "Kaka (काका)", 
  "Kaki (काकी)", 
  "Fupu (फुपू)", 
  "Fupaju (फुपाजु)",
  "Sriman (श्रीमान्)", 
  "Srimati (श्रीमती)"
];

export const commonGotras = [
  "Abhayananda (अभयानन्द)",
  "Agasti (अगस्ति)",
  "Agnivesha (अग्निवेश)",
  "Atreya (आत्रेय)",
  "Atri (अत्रि)",
  "Bharadwaj (भारद्वाज)",
  "Bhargava (भार्गव)",
  "Bishwamitra (विश्वामित्र)",
  "Garg (गर्ग)",
  "Gautam (गौतम)",
  "Jamadagni (जमदग्नि)",
  "Kashyap (कश्यप)",
  "Kaundinya (कौण्डिन्य)",
  "Kaushik (कौशिक)",
  "Parashar (पाराशर)",
  "Sandilya (शाण्डिल्य)",
  "Vashistha (वशिष्ठ)",
  "Vyas (व्यास)",
  "Other (अन्य)"
].sort();

export const shlokas = {
  wedding: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
  bratabandha: "ॐ भूर्भुवः स्वः तत्सवितुवरिण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
  nuworan: "आयुष्मान् भव सौम्य त्वं कुलदीपो भव सदा। मातापित्रोः प्रियो भूयाः देवतुल्यो भवाधुना॥",
  other: "ॐ शान्ति: शान्ति: शान्ति:"
};

export const ceremonyMessages = {
  wedding: "अति हर्षका साथ हामी तपाईंलाई हाम्रा सन्तानको शुभ-विवाहको पावन अवसरमा निमन्त्रणा गर्दछौं। यस खुसीको क्षणमा यहाँको गरिमामय उपस्थिति र आशीर्वादले नव-दम्पतीको दाम्पत्य जीवन सुखद रहनेछ भन्ने हाम्रो विश्वास छ।",
  bratabandha: "हाम्रो प्यारा छोराको चूडाकर्म (व्रतबन्ध) को शुभ अवसरमा यहाँको गरिमामय उपस्थितिको लागि स-परिवार हार्दिक निमन्त्रणा गर्दछौं।",
  nuworan: "परमेश्वरको कृपाले प्राप्त हाम्रो नव-आगन्तुक सन्तानको न्वारन (नामकरण) समारोहमा यहाँको उपस्थितिको लागि हार्दिक निमन्त्रणा गर्दछौं।",
};

export const premiumNepaliMessages = [
  {
    title: "परम्परागत विवाह (Traditional Wedding)",
    content: "॥ श्री गणेशाय नम: ॥\nअति हर्षका साथ हामी तपाईंलाई हाम्रा सुपुत्र र सुपुत्रीको शुभ-विवाहको पावन अवसरमा हार्दिक निमन्त्रणा गर्दछौं।\nयस खुसीको क्षणमा यहाँको गरिमामय उपस्थिति र नव-दम्पतीलाई प्रदान गरिने शुभाशिर्वादले उनीहरूको आगामी दाम्पत्य जीवन सुखमय र फलिफाप हुनेछ भन्ने हाम्रो पूर्ण विश्वास छ।\nतपाईंको आगमनले हाम्रो घर-आँगन अझै उज्यालो हुनेछ।"
  },
  {
    title: "आधुनिक विवाह (Modern Wedding)",
    content: "माया र विश्वासको नयाँ यात्रा सुरु गर्दैछौं!\nहाम्रो विवाहको यस उत्सवपूर्ण घडीमा तपाईंको सहभागिता हाम्रो लागि अमूल्य उपहार हुनेछ।\nआफ्नो व्यस्त समयका बाबजुद पनि पाल्नुभई नव-विवाहित जोडीलाई आशिष प्रदान गरिदिनुहुन स-परिवार हार्दिक अनुरोध गर्दछौं।\nहाम्रो खुसी साट्न तपाईंको उपस्थिति अनिवार्य छ।"
  },
  {
    title: "व्रतबन्ध (Sacred Thread Ceremony)",
    content: "हाम्रो प्यारा सुपुत्रको चूडाकर्म (व्रतबन्ध) को शुभ उपलक्ष्यमा आयोजना गरिएको धार्मिक विधि र प्रीतिभोजमा यहाँको गरिमामय उपस्थितिको लागि हार्दिक निमन्त्रणा गर्दछौं।\nकुल परम्परा अनुसार सम्पन्न हुन गइरहेको यस पवित्र कार्यमा यहाँको आशिर्वादले बालकको भविष्य उज्ज्वल हुनेछ भन्ने हाम्रो अभिलाषा छ।"
  },
  {
    title: "न्वारन (Naming Ceremony)",
    content: "ईश्वरको अनुपम उपहार स्वरूप प्राप्त हाम्रो नव-आगन्तुक सुपुत्र/सुपुत्रीको न्वारन (नामकरण) को अवसरमा यहाँको उपस्थितिको अपेक्षा गर्दछौं।\nयो खुसीको क्षणलाई सँगै मनाउन र शिशुलाई शुभाशिर्वाद दिन पाल्नुहुनेछ भन्ने आशा राखेका छौं।"
  },
  {
    title: "पास्नी (Rice Feeding Ceremony)",
    content: "हाम्रो सानो बाबु/नानीको शुभ-पास्नी (अन्नप्राशन) को अवसरमा यहाँको गरिमामय उपस्थितिको लागि हार्दिक निमन्त्रणा गर्दछौं।\nबालकले पहिलो पटक अन्न ग्रहण गर्ने यस विशेष घडीमा यहाँको आशिर्वाद हाम्रा लागि अत्यन्तै महत्वपूर्ण हुनेछ।"
  },
  {
    title: "प्रीतिभोज (Wedding Reception)",
    content: "विवाह सम्पन्न भएपश्चात् आयोजना गरिएको प्रीतिभोज समारोहमा यहाँको उपस्थितिको लागि हार्दिक अनुरोध गर्दछौं।\nएकै ठाउँमा जमघट भई खुसी साटासाट गर्ने यस अवसरमा पाल्नुभई नव-दम्पतीलाई शुभकामना र आशिष प्रदान गरिदिनुहोला।"
  },
  {
    title: "गुन्यू चोलो (Gunyo Cholo Ceremony)",
    content: "हाम्रो सुपुत्रीको गुन्यू चोलो (उमेर पुगेको विशेष संस्कार) को पावन अवसरमा यहाँको गरिमामय उपस्थितिको लागि हार्दिक निमन्त्रणा गर्दछौं।\nयस विशेष अवसरमा पाल्नुभई छोरीलाई शुभाशिर्वाद प्रदान गरिदिनुहुन विनम्र अनुरोध छ।"
  },
  {
    title: "छोटो र मिठो (Simple & Elegant)",
    content: "हाम्रो शुभ कार्यको अवसरमा तपाईंको गरिमामय उपस्थितिको अपेक्षा गर्दछौं।\nतपाईंको आगमनले हाम्रो उत्सवमा थप रौनक थप्नेछ र हामीलाई थप उत्साहित बनाउनेछ।\nकृपया स-परिवार पाल्नुभई हामीलाई सेवा गर्ने मौका दिनुहोला।"
  }
];
