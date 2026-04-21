

import { 
    nepMixWishes, royalWishes, corporateWishes, emotionalWishes, funnyWishes,
    anniversaryWishes, openingWishes, getWellSoonWishes, congratulationsWishes,
    weddingWishes, thankYouWishes, goodLuckWishes, condolenceWishes,
    farewellWishes, newBabyWishes, graduationWishes,
    valentineContent,
    dashainWishes, tiharWishes, christmasWishes, newYearWishes
} from './wishes';

export function getWish(category: string, name: string): string {
    const map: Record<string, string[]> = {
        'nepali-mix': nepMixWishes,
        'royal-formal': royalWishes,
        'corporate-professional': corporateWishes,
        'emotional-family': emotionalWishes,
        'funny': funnyWishes,
        'default': nepMixWishes // Fallback
    };
    const list = map[category] || map['default'];
    const wish = list[Math.floor(Math.random() * list.length)];
    // Replace placeholders, handling different casing
    return wish.replace(/\[Your Name]/gi, name).replace(/timi/gi, name);
}

export const generateValentine = (category: string, name: string) => {
  const selectedCategory = category as keyof typeof valentineContent;
  const list = valentineContent[selectedCategory] || valentineContent.classic;
  const random = list[Math.floor(Math.random() * list.length)];

  return {
    title: "HAPPY VALENTINE'S DAY ❤️",
    caption: `${random.caption} — ${name}`,
    tags: random.tags
  };
};


export const generateContent = (type: string, name: string) => {
  const lowerType = type.toLowerCase();
  
  const map: Record<string, { captions: string[]; tags: string[], title?: string }> = {
    "happy birthday": {
      captions: nepMixWishes, // Default for birthday, will be overridden by getWish
      tags: ["#HappyBirthday", "#BirthdayWishes", "#BirthdayCelebration", "#AnotherYearOlder", "#OmniToolsAI", "#BirthdayVibes", "#CakeDay", "#MakingMemories", "#GoldenYear"]
    },
    "advance birthday": {
      captions: [`🎉 Can't wait to celebrate! Happy early birthday, ${name}! Wishing you all the best for the year to come. ✨`],
      tags: ["#HappyEarlyBirthday", "#BirthdayCountdown", "#AdvanceWishes", "#PreBirthday", "#OmniToolsAI", "#BirthdayVibes", "#AlmostYourDay", "#MakingMemories", "#GoldenYear"]
    },
    "belated birthday": {
      captions: [`🎉 Better late than never! Hope you had a fantastic birthday, ${name}. Belated happy birthday! 🎂`],
      tags: ["#BelatedHappyBirthday", "#LateWishes", "#BirthdayCelebration", "#BetterLateThanNever", "#OmniToolsAI", "#BirthdayVibes", "#HopeItWasGreat", "#MakingMemories", "#GoldenYear"]
    },
    anniversary: {
      captions: anniversaryWishes,
      tags: ["#HappyAnniversary", "#Love", "#TogetherForever", "#Milestone", "#OmniToolsAI", "#CoupleGoals", "#WeddingAnniversary", "#Celebration", "#GoldenYears"]
    },
     "wedding anniversary": {
      captions: anniversaryWishes,
      tags: ["#HappyAnniversary", "#Love", "#TogetherForever", "#Milestone", "#OmniToolsAI", "#CoupleGoals", "#WeddingAnniversary", "#Celebration", "#GoldenYears"]
    },
    opening: {
      captions: openingWishes,
      tags: ["#GrandOpening", "#NewBusiness", "#NowOpen", "#SupportLocal", "#OmniToolsAI", "#EntrepreneurLife", "#BusinessLaunch", "#Success", "#NewVenture"]
    },
    'get well soon': {
      captions: getWellSoonWishes,
      tags: ["#GetWellSoon", "#SpeedyRecovery", "#ThinkingOfYou", "#HealthIsWealth", "#OmniToolsAI", "#StayStrong", "#FeelBetterSoon", "#HealingVibes", "#PositiveThoughts"]
    },
    congratulations: {
        captions: congratulationsWishes,
        tags: ["#Congratulations", "#Success", "#Achievement", "#ProudMoment", "#OmniToolsAI", "#HardWorkPaysOff", "#WellDone", "#Celebration", "#YouDidIt"]
    },
    wedding: {
        captions: weddingWishes,
        tags: ["#JustMarried", "#WeddingDay", "#HappilyEverAfter", "#MrAndMrs", "#OmniToolsAI", "#WeddingBells", "#TyingTheKnot", "#NewChapter", "#Love"]
    },
    'thank you': {
        captions: thankYouWishes,
        tags: ["#ThankYou", "#Gratitude", "#MuchAppreciated", "#KindnessMatters", "#OmniToolsAI", "#SoGrateful", "#Thanks", "#ShowingLove", "#Thankful"]
    },
    'good luck': {
        captions: goodLuckWishes,
        tags: ["#GoodLuck", "#BestOfLuck", "#YouCanDoIt", "FingersCrossed", "#OmniToolsAI", "#WishingYouTheBest", "#GoForIt", "#Success", "#YouGotThis"]
    },
    condolence: {
        captions: condolenceWishes,
        tags: ["#DeepestCondolences", "#Sympathy", "#WithYouInSpirit", "#SorryForYourLoss", "#OmniToolsAI", "#InOurThoughts", "#HeartfeltCondolences", "#Tribute", "#ThinkingOfYou"]
    },
    farewell: {
        captions: farewellWishes,
        tags: ["#Farewell", "#NewBeginnings", "#GoodLuck", "#BonVoyage", "#OmniToolsAI", "#UntilWeMeetAgain", "#NewAdventures", "#AllTheBest", "#Goodbye"]
    },
    'new baby': {
        captions: newBabyWishes,
        tags: ["#WelcomeBaby", "#NewAddition", "#Congratulations", "#BabyJoy", "#OmniToolsAI", "#Parenthood", "#BundleOfJoy", "#NewFamilyMember", "#BabyLove"]
    },
    graduation: {
        captions: graduationWishes,
        tags: ["#Graduation", `#ClassOf${new Date().getFullYear()}`, "#CongratsGrad", "#FutureIsBright", "#OmniToolsAI", "#AchievementUnlocked", "#GraduationDay", "#ProudMoment", "#DoneWithSchool"]
    },
    "happy dashain": {
      captions: dashainWishes,
      tags: ["#HappyDashain", "#Dashain", "#BadaDashain", "#VijayaDashami", "#OmniToolsAI"]
    },
    "happy tihar": {
      captions: tiharWishes,
      tags: ["#HappyTihar", "#Tihar", "#FestivalOfLights", "#Deepawali", "#LaxmiPuja", "#OmniToolsAI"]
    },
    "happy diwali": { // Alias for Tihar
      captions: tiharWishes,
      tags: ["#HappyDiwali", "#Diwali", "#FestivalOfLights", "#Deepawali", "#LaxmiPuja", "#OmniToolsAI"]
    },
    "merry christmas": {
        captions: christmasWishes,
        tags: ["#MerryChristmas", "#Christmas", "#Xmas", "#Holidays", "#Festive", "#OmniToolsAI"]
    },
    "happy new year": {
        captions: newYearWishes,
        tags: ["#HappyNewYear", "#NewYear", "#Celebration", "#NewBeginnings", "#OmniToolsAI"],
        title: "Happy New Year"
    }
  };

  if (map[lowerType]) {
    const contentData = map[lowerType];
    const caption = contentData.captions[Math.floor(Math.random() * contentData.captions.length)];
    return {
        title: contentData.title || type.toUpperCase(),
        caption: caption.replace(/\{name\}/gi, name).replace(/\[Your Name]/gi, name).replace(/timi/gi, name),
        tags: contentData.tags
    };
  }

  // Fallback for custom types
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
  const sanitizedType = type.replace(/\s+/g, '');
  return {
    title: `HAPPY ${capitalizedType.toUpperCase()}`,
    caption: `Best wishes to ${name} on this special ${capitalizedType} occasion!`,
    tags: [`#${sanitizedType}`, `#${sanitizedType}Event`, "#SpecialOccasion", "#MakingMemories", "#OmniToolsAI", "#Celebration", "#GoodTimes", "#InstaGood", "#Event"]
  };
};

export function generateHashtags(type: string): string[] {
    const content = generateContent(type, ""); // name doesn't matter for hashtags
    return content.tags;
}
