import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SEED_USER_EMAIL = "seed@safetify.com";

async function main() {
  console.log("Seeding incidents...");

  // Create or find a seed user
  let user = await prisma.user.findUnique({ where: { email: SEED_USER_EMAIL } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Seed User",
        email: SEED_USER_EMAIL,
        emailVerified: true,
        role: "USER",
        accountStatus: "ACTIVE",
      },
    });
    console.log("Created seed user:", user.id);
  } else {
    console.log("Found existing seed user:", user.id);
  }

  // Clear old seed incidents
  await prisma.incident.deleteMany({ where: { userId: user.id } });
  console.log("Cleared old seed incidents.");

  const now = new Date();

  const incidents = [
    // ── Mirpur ──
    {
      title: "Chain Snatching on Mirpur Road",
      description: "A woman walking near Mirpur-10 was attacked by two men on a motorcycle who snatched her gold chain and fled toward Pallabi.",
      latitude: 23.8042, longitude: 90.3530,
      severityLevel: "high", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Female pedestrian, age 34", attackers: "2 men on motorcycle",
      deathToll: 0, injuryCount: 1, peopleHelped: 3,
      stories: ["Victim was walking home from work", "Auto-rickshaw drivers chased the attackers but lost them", "Filed General Diary at Mirpur Police Station"],
      daysAgo: 1,
    },
    {
      title: "Robbery Near Mirpur-12 Bazaar",
      description: "A group of 3-4 young men attacked a shopkeeper closing his store and robbed cash and mobile phone.",
      latitude: 23.8110, longitude: 90.3610,
      severityLevel: "high", timing: "Night (08:00 – 11:00 PM)",
      victim: "Male shopkeeper, age 45", attackers: "Group of 3-4 young men",
      deathToll: 0, injuryCount: 1, peopleHelped: 2,
      stories: ["Attackers threatened with a sharp weapon", "Neighbors heard screams and rushed out", "One attacker was identified from CCTV footage"],
      daysAgo: 3,
    },
    {
      title: "Mob Harassment at Mirpur-1 Roundabout",
      description: "A female college student was verbally harassed by a group of men near the Mirpur-1 roundabout while waiting for transport.",
      latitude: 23.7980, longitude: 90.3560,
      severityLevel: "medium", timing: "Afternoon (02:00 – 05:00 PM)",
      victim: "Female college student, age 19", attackers: "Group of 5-6 men",
      deathToll: 0, injuryCount: 0, peopleHelped: 4,
      stories: ["Other commuters intervened and helped her leave safely", "CNG drivers formed a protective ring", "Reported to nearest police outpost"],
      daysAgo: 5,
    },

    // ── Motijheel ──
    {
      title: "Pickpocketing at Motijheel Cattle Market",
      description: "During Friday rush at the cattle market, multiple pickpockets were reported targeting visitors. At least 5 complaints filed.",
      latitude: 23.7330, longitude: 90.4180,
      severityLevel: "medium", timing: "Morning (08:00 – 11:00 AM)",
      victim: "Multiple visitors", attackers: "Organized pickpocket ring",
      deathToll: 0, injuryCount: 0, peopleHelped: 8,
      stories: ["Police deployed additional forces after complaints", "One suspect was caught by crowd and handed to police", "Victims lost phones, wallets totaling over 50,000 BDT"],
      daysAgo: 2,
    },
    {
      title: "Mugging Near Motijheel GPO",
      description: "A businessman was attacked near the General Post Office and robbed of his laptop bag containing documents and a MacBook.",
      latitude: 23.7345, longitude: 90.4210,
      severityLevel: "high", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Male businessman, age 38", attackers: "3 men on foot",
      deathToll: 0, injuryCount: 2, peopleHelped: 1,
      stories: ["Attackers pushed victim to the ground", "A passerby tried to help but was also threatened", "Security camera footage handed to police"],
      daysAgo: 4,
    },
    {
      title: "Carjacking Attempt at Dilkusha",
      description: "A ride-share driver was forced out of his car at knifepoint near Dilkusha C/A. The vehicle was later recovered abandoned.",
      latitude: 23.7290, longitude: 90.4200,
      severityLevel: "critical", timing: "Late Night (11:00 PM – 02:00 AM)",
      victim: "Male ride-share driver, age 29", attackers: "4 armed men",
      deathToll: 0, injuryCount: 1, peopleHelped: 0,
      stories: ["Driver was threatened with a knife", "Abandoned car found in Old Dhaka next morning", "Police launched investigation"],
      daysAgo: 7,
    },

    // ── Gulshan / Banani ──
    {
      title: "Home Invasion in Gulshan-2",
      description: "Armed intruders broke into a third-floor apartment in Gulshan-2 and held the family hostage for 20 minutes, stealing valuables.",
      latitude: 23.7925, longitude: 90.4078,
      severityLevel: "critical", timing: "Late Night (11:00 PM – 02:00 AM)",
      victim: "Family of four", attackers: "3 armed men",
      deathToll: 0, injuryCount: 1, peopleHelped: 2,
      stories: ["Intruders entered through the balcony", "Children were present during the robbery", "Guard from next building called police"],
      daysAgo: 6,
    },
    {
      title: "Bag Snatching in Banani DOHS",
      description: "A woman jogging in Banani DOHS had her purse snatched by two men on a bike. She fell and sustained minor injuries.",
      latitude: 23.7940, longitude: 90.4020,
      severityLevel: "high", timing: "Morning (08:00 – 11:00 AM)",
      victim: "Female jogger, age 27", attackers: "2 men on motorcycle",
      deathToll: 0, injuryCount: 1, peopleHelped: 3,
      stories: ["Victim was jogging on the regular morning route", "Security guard from nearby residence chased the attackers", "Victim treated at nearby clinic for scrapes"],
      daysAgo: 8,
    },
    {
      title: "Mobile Phone Snatching at Gulshan-1",
      description: "A teenager had his phone snatched while texting near the Gulshan-1 circle. The attacker fled on foot into a narrow lane.",
      latitude: 23.7890, longitude: 90.4125,
      severityLevel: "medium", timing: "Afternoon (02:00 – 05:00 PM)",
      victim: "Male teenager, age 16", attackers: "1 man, mid-20s",
      deathToll: 0, injuryCount: 0, peopleHelped: 2,
      stories: ["Victim was distracted by a phone call", "Local shopkeepers identified the suspect", "FIR filed at Gulshan Police Station"],
      daysAgo: 10,
    },

    // ── Dhanmondi ──
    {
      title: "Assault Near Dhanmondi Lake",
      description: "A couple walking near Dhanmondi Lake was attacked by a group who attempted to rob them. The man was beaten when he resisted.",
      latitude: 23.7486, longitude: 90.3742,
      severityLevel: "high", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Male victim, age 31", attackers: "Group of 4 men",
      deathToll: 0, injuryCount: 2, peopleHelped: 6,
      stories: ["Couple was walking along the lake promenade", "Other joggers and rickshaw pullers came to help", "Attackers fled toward Shukrasta"],
      daysAgo: 1,
    },
    {
      title: "Harassment at Dhanmondi 27",
      description: "Female university student verbally harassed while walking to coaching center. Harassers followed her for two blocks.",
      latitude: 23.7510, longitude: 90.3780,
      severityLevel: "medium", timing: "Afternoon (02:00 – 05:00 PM)",
      victim: "Female university student, age 21", attackers: "3 young men on foot",
      deathToll: 0, injuryCount: 0, peopleHelped: 3,
      stories: ["Student ran into a nearby shop for safety", "Shop owner confronted the harassers", "Auto-rickshaw driver helped her get home safely"],
      daysAgo: 3,
    },
    {
      title: "Bike Theft at Dhanmondi Jhigatola",
      description: "A motorcycle parked outside a restaurant was stolen broad daylight. Owner discovered it gone after 45-minute meal.",
      latitude: 23.7460, longitude: 90.3720,
      severityLevel: "low", timing: "Midday (11:00 AM – 02:00 PM)",
      victim: "Male restaurant patron, age 35", attackers: "Unknown",
      deathToll: 0, injuryCount: 0, peopleHelped: 0,
      stories: ["CCTV showed two men cutting the lock", "Bike was a Yamaha FZ-S, registered in Dhaka", "Complaint filed with Dhanmondi police"],
      daysAgo: 12,
    },

    // ── Uttara ──
    {
      title: "Expressway Mugging in Uttara Sector-14",
      description: "A couple returning from a dinner party were intercepted near the expressway service road. Armed men stole jewelry and phones.",
      latitude: 23.8750, longitude: 90.3650,
      severityLevel: "critical", timing: "Night (08:00 – 11:00 PM)",
      victim: "Couple, ages 33 and 30", attackers: "5 armed men",
      deathToll: 0, injuryCount: 2, peopleHelped: 1,
      stories: ["Attackers blocked the road with a cart", "Female victim's gold bangles were forcibly taken", "Highway patrol arrived 15 minutes after the incident"],
      daysAgo: 2,
    },
    {
      title: "ATM Robbery in Uttara Sector-3",
      description: "A man withdrawing cash from an ATM booth was attacked from behind. Two assailants took the cash and his card.",
      latitude: 23.8700, longitude: 90.3590,
      severityLevel: "high", timing: "Night (08:00 – 11:00 PM)",
      victim: "Male IT professional, age 28", attackers: "2 men",
      deathToll: 0, injuryCount: 1, peopleHelped: 0,
      stories: ["ATM had no security guard at the time", "Victim was struck on the head from behind", "Card was later used to withdraw additional 40,000 BDT"],
      daysAgo: 5,
    },
    {
      title: "Stalking Incident in Uttara Sector-7",
      description: "A female teacher was followed home from her workplace for three consecutive days by the same individual.",
      latitude: 23.8650, longitude: 90.3680,
      severityLevel: "medium", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Female school teacher, age 26", attackers: "1 man, repeated stalker",
      deathToll: 0, injuryCount: 0, peopleHelped: 2,
      stories: ["Teacher noticed the same person behind her daily", "Family confronted the stalker on the third day", "Reported to local police, restraining order sought"],
      daysAgo: 9,
    },

    // ── Farmgate / Tejgaon ──
    {
      title: "Crowd Assault at Farmgate Overpass",
      description: "A man was robbed and beaten by a gang operating under the Farmgate overpass during evening rush hour.",
      latitude: 23.7575, longitude: 90.3870,
      severityLevel: "high", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Male office worker, age 40", attackers: "Gang of 4-5 men",
      deathToll: 0, injuryCount: 2, peopleHelped: 3,
      stories: ["Victim was walking from office to catch a bus", "Gang targeted him in the crowded underpass", "Bus passengers helped chase the attackers"],
      daysAgo: 4,
    },
    {
      title: "Sexual Harassment at Tejgaon Bus Stand",
      description: "A woman waiting at the Tejgaon bus stand was groped by a man in the crowd. The suspect fled when she screamed.",
      latitude: 23.7530, longitude: 90.3910,
      severityLevel: "high", timing: "Morning (08:00 – 11:00 AM)",
      victim: "Female garment worker, age 23", attackers: "1 man in crowd",
      deathToll: 0, injuryCount: 0, peopleHelped: 5,
      stories: ["Woman screamed and pointed out the attacker", "Bus stand staff and commuters caught the suspect", "Handed over to Tejgaon police"],
      daysAgo: 1,
    },
    {
      title: "Rickshaw Fare Dispute Turned Violent",
      description: "A rickshaw puller was stabbed after a fare dispute with passengers near Tejgaon Industrial Area.",
      latitude: 23.7560, longitude: 90.3890,
      severityLevel: "critical", timing: "Night (08:00 – 11:00 PM)",
      victim: "Male rickshaw puller, age 50", attackers: "2 intoxicated men",
      deathToll: 0, injuryCount: 1, peopleHelped: 4,
      stories: ["Passengers refused to pay the agreed fare", "Argument escalated and one pulled a knife", "Rickshaw puller rushed to DMCH, survived"],
      daysAgo: 6,
    },

    // ── Old Dhaka / Sadarghat ──
    {
      title: "Snatching at Chawk Bazaar",
      description: "A tourist had her handbag snatched in the crowded Chawk Bazaar area. The bag contained passport and 15,000 BDT.",
      latitude: 23.7095, longitude: 90.3970,
      severityLevel: "high", timing: "Midday (11:00 AM – 02:00 PM)",
      victim: "Female tourist, age 32", attackers: "2 young men on foot",
      deathToll: 0, injuryCount: 0, peopleHelped: 7,
      stories: ["Tourist was exploring the heritage area", "Local shopkeepers helped trace the suspects", "Passport recovered from a trash bin nearby"],
      daysAgo: 3,
    },
    {
      title: "Dacoity at Lalbagh Fort Road",
      description: "Three men on a motorcycle stopped a family near Lalbagh Fort and robbed them of gold ornaments at knifepoint.",
      latitude: 23.7204, longitude: 90.3965,
      severityLevel: "critical", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Family of three", attackers: "3 men on motorcycle",
      deathToll: 0, injuryCount: 1, peopleHelped: 3,
      stories: ["Family was returning from visiting the fort", "Elderly mother was pushed down during the robbery", "Rickshaw pullers helped them to the nearest police box"],
      daysAgo: 2,
    },
    {
      title: "Vendor Extortion at Sadarghat",
      description: "River port area vendors reported organized extortion demanding daily payments. Several vendors were physically threatened.",
      latitude: 23.7080, longitude: 90.4030,
      severityLevel: "medium", timing: "Morning (08:00 – 11:00 AM)",
      victim: "Multiple river port vendors", attackers: "Organized extortion group",
      deathToll: 0, injuryCount: 2, peopleHelped: 10,
      stories: ["Vendors refused to pay and filed a joint complaint", "Two vendors had their stalls destroyed", "River port authority promised increased security"],
      daysAgo: 8,
    },

    // ── Mohammadpur ──
    {
      title: "Mobile Snatching Near Mohammadpur Stadium",
      description: "A college student had his phone snatched by two bike-borne assailants near the National Stadium.",
      latitude: 23.7690, longitude: 90.3620,
      severityLevel: "medium", timing: "Afternoon (02:00 – 05:00 PM)",
      victim: "Male college student, age 20", attackers: "2 men on motorcycle",
      deathToll: 0, injuryCount: 0, peopleHelped: 2,
      stories: ["Student was crossing the road near the stadium", "Bike came from behind and snatched the phone", "Nearby tea stall owner noted the license plate"],
      daysAgo: 7,
    },
    {
      title: "Domestic Violence Incident in Mohammadpur",
      description: "Neighbors reported ongoing domestic violence in a Mohammadpur apartment. Police intervened after multiple complaints.",
      latitude: 23.7710, longitude: 90.3640,
      severityLevel: "high", timing: "Night (08:00 – 11:00 PM)",
      victim: "Female resident, age 36", attackers: "Husband",
      deathToll: 0, injuryCount: 1, peopleHelped: 4,
      stories: ["Neighbors had heard disturbances for several nights", "Women's helpline was also contacted", "Police filed a case and the woman was placed in safe shelter"],
      daysAgo: 5,
    },

    // ── Badda ──
    {
      title: "Highway Robbery on Badda Link Road",
      description: "A delivery truck was stopped by armed men on the Badda link road and goods worth 2 lakh BDT were stolen.",
      latitude: 23.7660, longitude: 90.4270,
      severityLevel: "critical", timing: "Deep Night (02:00 – 05:00 AM)",
      victim: "Male truck driver, age 42", attackers: "5-6 armed men",
      deathToll: 0, injuryCount: 1, peopleHelped: 0,
      stories: ["Truck was forced to stop by a blocked road", "Driver was tied up and beaten", "Goods included electronics meant for a local shop"],
      daysAgo: 4,
    },
    {
      title: "Robbery at Badda Gas Station",
      description: "Three men entered a gas station at gunpoint late at night and stole all cash from the register.",
      latitude: 23.7680, longitude: 90.4300,
      severityLevel: "high", timing: "Late Night (11:00 PM – 02:00 AM)",
      victim: "Gas station attendant, age 22", attackers: "3 men, one with gun",
      deathToll: 0, injuryCount: 0, peopleHelped: 0,
      stories: ["Only one attendant was on duty", "Gunman threatened to shoot if alarm was triggered", "About 80,000 BDT stolen from register and safe"],
      daysAgo: 9,
    },

    // ── Shahbagh / Elephant Road ──
    {
      title: "Proturn Violence Near Shahbagh Intersection",
      description: "Clashes broke out between two student groups near Shahbagh, injuring several bystanders and halting traffic for hours.",
      latitude: 23.7375, longitude: 90.3950,
      severityLevel: "critical", timing: "Afternoon (02:00 – 05:00 PM)",
      victim: "Multiple bystanders", attackers: "Student group members",
      deathToll: 1, injuryCount: 12, peopleHelped: 15,
      stories: ["Clashes started over a political disagreement", "Rapid Action Battalion eventually dispersed the crowd", "Three journalists were also injured"],
      daysAgo: 14,
    },
    {
      title: "Bag Snatching at Elephant Road",
      description: "A woman had her laptop bag snatched near Elephant Road while walking to tuition. The bag contained a laptop and notes.",
      latitude: 23.7360, longitude: 90.3920,
      severityLevel: "high", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Female university student, age 22", attackers: "2 men on foot",
      deathToll: 0, injuryCount: 1, peopleHelped: 2,
      stories: ["Student was pushed from behind", "Local shop owners helped identify the suspects", "Laptop was later found abandoned without the hard drive"],
      daysAgo: 6,
    },

    // ── Cantonment / Dhaka Cantonment ──
    {
      title: "Car Break-in at Cantonment Market",
      description: "Multiple cars parked near the Cantonment market had their windows smashed. Electronics and cash stolen from at least 5 vehicles.",
      latitude: 23.8190, longitude: 90.4030,
      severityLevel: "medium", timing: "Midday (11:00 AM – 02:00 PM)",
      victim: "Multiple car owners", attackers: "Organized group",
      deathToll: 0, injuryCount: 0, peopleHelped: 1,
      stories: ["Security cameras captured the suspects", "Total loss estimated at 3 lakh BDT", "Military police increased patrols in the area"],
      daysAgo: 11,
    },

    // ── Rampura / Khilgaon ──
    {
      title: "Attack on Family in Rampura",
      description: "A family returning from a relative's house was attacked by a group demanding ransom. The father was severely beaten.",
      latitude: 23.7520, longitude: 90.4250,
      severityLevel: "critical", timing: "Night (08:00 – 11:00 PM)",
      victim: "Family of four", attackers: "6 armed men",
      deathToll: 0, injuryCount: 2, peopleHelped: 1,
      stories: ["Family was intercepted near a deserted stretch", "Attackers demanded 5 lakh BDT", "Father was hospitalized with head injuries"],
      daysAgo: 3,
    },
    {
      title: "Street Harassment in Khilgaon",
      description: "A nurse walking to her night shift was harassed by a group of men near Khilgaon Taltola.",
      latitude: 23.7540, longitude: 90.4300,
      severityLevel: "high", timing: "Late Night (11:00 PM – 02:00 AM)",
      victim: "Female nurse, age 25", attackers: "Group of 4 men",
      deathToll: 0, injuryCount: 0, peopleHelped: 3,
      stories: ["Nurse was walking to her hospital night shift", "Auto-rickshaw driver intervened and chased away the group", "Hospital arranged pickup service for night-shift staff"],
      daysAgo: 2,
    },

    // ── Hazaribagh / Kamrangir Char ──
    {
      title: "Extortion Racket in Hazaribagh",
      description: "Small business owners in Hazaribagh reported a systematic extortion racket demanding monthly payments.",
      latitude: 23.7320, longitude: 90.3870,
      severityLevel: "medium", timing: "Morning (08:00 – 11:00 AM)",
      victim: "Multiple business owners", attackers: "Organized crime group",
      deathToll: 0, injuryCount: 3, peopleHelped: 12,
      stories: ["Owners formed a联合 front against the extortionists", "Two shopkeepers were beaten for refusing to pay", "Police promised increased patrols"],
      daysAgo: 15,
    },
    {
      title: "Armed Robbery at Kamrangir Char",
      description: "A family was held at gunpoint in their home near the river and robbed of all gold ornaments and electronics.",
      latitude: 23.7140, longitude: 90.3920,
      severityLevel: "critical", timing: "Deep Night (02:00 – 05:00 AM)",
      victim: "Family of five", attackers: "4 armed men",
      deathToll: 0, injuryCount: 1, peopleHelped: 0,
      stories: ["Intruders cut through the tin roof", "Elderly grandfather was threatened at gunpoint", "Gold ornaments worth over 5 lakh BDT stolen"],
      daysAgo: 5,
    },

    // ── Jatrabari ──
    {
      title: "Robbery Near Jatrabari Flyover",
      description: "A commuter was robbed at knifepoint while walking under the Jatrabari flyover after dark.",
      latitude: 23.7120, longitude: 90.4230,
      severityLevel: "high", timing: "Night (08:00 – 11:00 PM)",
      victim: "Male commuter, age 33", attackers: "2 men",
      deathToll: 0, injuryCount: 1, peopleHelped: 1,
      stories: ["Victim was walking to catch a bus home", "Attackers emerged from the shadows under the flyover", "Auto-rickshaw driver took victim to police station"],
      daysAgo: 7,
    },

    // ── Baridhara ──
    {
      title: "Purse Snatching in Baridhara J Block",
      description: "An expatriate woman had her purse snatched while jogging in the Baridhara J Block area.",
      latitude: 23.7970, longitude: 90.4210,
      severityLevel: "medium", timing: "Morning (08:00 – 11:00 AM)",
      victim: "Female expatriate, age 37", attackers: "1 man on bicycle",
      deathToll: 0, injuryCount: 0, peopleHelped: 2,
      stories: ["Woman was jogging in her usual route", "Attacker snatched the purse and cycled away fast", "Security from the nearest embassy compound helped"],
      daysAgo: 10,
    },

    // ── Lalbagh / Kotwali ──
    {
      title: "Pickpocket Ring Busted at Lalbagh",
      description: "A coordinated pickpocket ring targeting tourists near Lalbagh Fort was busted by police after multiple complaints.",
      latitude: 23.7210, longitude: 90.3950,
      severityLevel: "medium", timing: "Midday (11:00 AM – 02:00 PM)",
      victim: "Multiple tourists", attackers: "Organized pickpocket group of 8",
      deathToll: 0, injuryCount: 0, peopleHelped: 5,
      stories: ["Police set up plainclothes officers in the area", "Three suspects were arrested with stolen goods", "Stolen items worth over 2 lakh BDT recovered"],
      daysAgo: 13,
    },

    // ── Airport Road / Nikunja ──
    {
      title: "Carjacking Attempt on Airport Road",
      description: "A businessman was targeted on the airport road near Nikunja. His car was forcibly taken but recovered by police within hours.",
      latitude: 23.8340, longitude: 90.4010,
      severityLevel: "critical", timing: "Late Night (11:00 PM – 02:00 AM)",
      victim: "Male businessman, age 48", attackers: "3 armed men",
      deathToll: 0, injuryCount: 1, peopleHelped: 0,
      stories: ["Businessman was returning from the airport", "Attackers blocked his car at a construction zone", "Police found the car abandoned near Uttara"],
      daysAgo: 8,
    },

    // ── Shyamoli / Adabor ──
    {
      title: "Mobile Snatching at Shyamoli Square",
      description: "A nurse returning from work had her phone snatched by bike-borne assailants at Shyamoli roundabout.",
      latitude: 23.7680, longitude: 90.3600,
      severityLevel: "medium", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Female nurse, age 28", attackers: "2 men on motorcycle",
      deathToll: 0, injuryCount: 0, peopleHelped: 3,
      stories: ["Nurse was waiting at the roundabout for traffic", "Motorcycle came from behind and snatched phone", "Traffic police chased the suspects but lost them"],
      daysAgo: 4,
    },
    {
      title: "Assault at Adabor Vegetable Market",
      description: "A vegetable vendor was assaulted and robbed of the day's earnings by two men near Adabor Bazar.",
      latitude: 23.7650, longitude: 90.3560,
      severityLevel: "high", timing: "Evening (05:00 – 08:00 PM)",
      victim: "Male vegetable vendor, age 55", attackers: "2 young men",
      deathToll: 0, injuryCount: 1, peopleHelped: 4,
      stories: ["Vendor was closing his stall for the day", "Attackers took the cash box containing 12,000 BDT", "Fellow vendors chased the attackers but they escaped"],
      daysAgo: 2,
    },
  ];

  for (const inc of incidents) {
    const reportedAt = new Date(now.getTime() - inc.daysAgo * 86400000);
    await prisma.incident.create({
      data: {
        userId: user.id,
        title: inc.title,
        description: inc.description,
        latitude: inc.latitude,
        longitude: inc.longitude,
        severityLevel: inc.severityLevel,
        timing: inc.timing,
        victim: inc.victim,
        attackers: inc.attackers,
        deathToll: inc.deathToll,
        injuryCount: inc.injuryCount,
        peopleHelped: inc.peopleHelped,
        stories: inc.stories,
        reportedAt,
      },
    });
  }

  console.log(`Seeded ${incidents.length} incidents.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Done.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
