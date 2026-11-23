import React, { useState } from 'react';

export type LangMode = 'en' | 'hi' | 'hinglish';

export const CATEGORY_TRANSLATIONS: Record<string, { hi: string; hinglish: string }> = {
  All: { hi: 'सभी मामले', hinglish: 'Sabhi Matters' },
  Marital: { hi: 'वैवाहिक एवं पारिवारिक', hinglish: 'Marital & Family' },
  Criminal: { hi: 'आपराधिक मामले', hinglish: 'Criminal Matters' },
  'Theft & Cyber': { hi: 'चोरी एवं साइबर अपराध', hinglish: 'Chori & Cyber Fraud' },
  Property: { hi: 'संपत्ति एवं किराया', hinglish: 'Property & Kiraya' },
  Consumer: { hi: 'उपभोक्ता धोखाधड़ी', hinglish: 'Consumer Fraud' },
  Labour: { hi: 'श्रम एवं वेतन विवाद', hinglish: 'Salary & Labour' },
  Financial: { hi: 'वित्तीय एवं चेक बाउंस', hinglish: 'Financial & Cheque' },
};

export function translateCategory(cat: string, lang: LangMode): string {
  if (lang === 'en') return cat;
  const entry = CATEGORY_TRANSLATIONS[cat];
  if (!entry) return cat;
  return lang === 'hi' ? entry.hi : entry.hinglish;
}

/**
 * Comprehensive Hindi (Devanagari) dictionary covering every English string on Vakaalat.
 */
export const HINDI_DICTIONARY: Record<string, string> = {
  // Navbar
  'Court of People': 'जनता की अदालत',
  Leaderboard: 'वकील लीडरबोर्ड',
  'Attorney Leaderboard': 'वकील लीडरबोर्ड',
  'Advocate Chambers': 'वकील चैंबर',
  'Personal Diary': 'मेरी गुप्त डायरी',
  'My Secret Diary': 'मेरी गुप्त डायरी',
  'Sign In': 'साइन इन करें',
  'Sign Out': 'लॉग आउट',

  // Landing Page
  'You are seen. You are heard. Vakaalat is your backroom court.':
    'आपकी बात सुनी जाएगी। आपकी पहचान गुप्त रहेगी। वकालत आपकी अपनी अदालत है।',
  'Legal help is a right—never a luxury. Speak freely without exposing your name, get immediate First-Aid Dhaarein and government portal steps, and stand before the Court of People.':
    'कानूनी मदद आपका अधिकार है। बिना अपना नाम बताए अपनी समस्या लिखें, तुरंत लागू होने वाली धाराएं और सरकारी पोर्टल के कदम जानें, और जनता की अदालत से जुड़ें।',
  'I need legal help': 'मुझे कानूनी मदद चाहिए',
  'I provide legal help': 'मैं कानूनी मदद देता हूँ',
  'Open Court of People': 'जनता की अदालत खोलें',
  'Launch First-Aid Desk': 'फर्स्ट-एड लीगल डेस्क खोलें',
  'What is Vakaalat?': 'वकालत क्या है?',
  'Speak Without Fear': 'बिना डर के अपनी बात रखें',
  'Clients never upload profile photos. Every citizen gets a celebrity alias and exact rupee amounts stay blurred in public.':
    'नागरिकों की कोई प्रोफाइल फोटो नहीं होती। हर व्यक्ति को एक गुप्त उपनाम मिलता है और पैसों की राशि सार्वजनिक रूप से धुंधली (Blur) रहती है।',
  'Know Your Dhaarein': 'अपनी कानूनी धाराएं जानें',
  'Get immediate BNS, Constitution, Consumer & IT Act sections violated against you—plus hoverable "i" steps for official government portals.':
    'भारतीय न्याय संहिता (BNS), संविधान, उपभोक्ता और आईटी अधिनियम की वे धाराएं तुरंत जानें जो आपके खिलाफ तोड़ी गई हैं—साथ ही सरकारी पोर्टल के स्टेप-बाय-स्टेप निर्देश पाएं।',
  'Post your masked grievance publicly. Verified Kanpur advocates reply—ranked purely by helpful likes, never paid ads.':
    'अपनी पहचान छुपाकर अपनी शिकायत सार्वजनिक रूप से साझा करें। कानपुर के सत्यापित वकील आपकी मदद करते हैं—जिनकी रैंकिंग विज्ञापनों से नहीं, बल्कि मददगार जवाबों के लाइक्स से तय होती है।',
  'Our Vision': 'हमारा उद्देश्य',
  '“If it sticks with you when you are alone, you might as well share it here.”':
    '“अगर कोई बात अकेले में आपको चुभती है, तो उसे चुपचाप सहने के बजाय यहाँ साझा करें।”',
  'We dream of building a community that backs the emotion when you feel you have been wronged. Because life is so fast-paced, you often doubt yourself for feeling hurt—wondering if you are overreacting, or if you should stop cribbing and just move on. No. Stay anonymous, share it here, and listen to what others think. You are not alone.':
    'हम एक ऐसा समुदाय बनाना चाहते हैं जो आपके साथ हुए अन्याय में आपके साथ खड़ा हो। आज की तेज़ ज़िंदगी में लोग अक्सर खुद पर शक करने लगते हैं कि कहीं वे ज़्यादा तो नहीं सोच रहे। नहीं—अपनी पहचान गुप्त रखें, यहाँ अपनी बात लिखें, और देखें कि कानून और समाज आपके बारे में क्या कहता है। आप अकेले नहीं हैं।',
  'Write to us! We are open to suggestions.': 'हमें लिखें! आपके सुझावों का स्वागत है।',
  'Missing a government portal, a legal category, or a feature that would make Vakaalat safer for you? Drop a note—every suggestion goes straight to our team.':
    'क्या कोई सरकारी पोर्टल, कानूनी श्रेणी या सुविधा जोड़नी चाहिए जिससे वकालत आपके लिए और बेहतर बन सके? नीचे लिखें—आपका हर सुझाव सीधे हमारे पास पहुँचता है।',
  'Your email (optional — stay anonymous if you want)': 'आपका ईमेल (वैकल्पिक — चाहें तो गुप्त रहें)',
  'Tell us how we can make Vakaalat better for you...': 'बताएं कि हम वकालत को आपके लिए और बेहतर कैसे बना सकते हैं...',
  'Send Suggestion': 'सुझाव भेजें',
  'Thank you! Your suggestion has been saved.': 'धन्यवाद! आपका सुझावfunnycoder241@gmail.com पर भेज दिया गया है।',

  // Legal Engine (JollyTypewriter)
  'Private First-Aid Legal Engine — Every story is examined live with care & respect.':
    'प्राइवेट फर्स्ट-एड लीगल इंजन — हर घटना की लाइव, सम्मान और संवेदनशीलता के साथ जांच की जाती है।',
  'Write your whole story in your own tone. Raw and real.':
    'अपनी पूरी कहानी अपने शब्दों में लिखें। बिल्कुल सच्ची और बिना किसी झिझक के।',
  'Analyzed live against Indian Law & Constitution.':
    'भारतीय कानून और संविधान के अनुसार सीधा (Live) विश्लेषण।',
  'Record Voice': 'आवाज़ रिकॉर्ड करें',
  'Stop Mic': 'माइक रोकें',
  'Help me out': 'मेरी मदद करें',
  'Examining Indian Laws...': 'कानूनी धाराओं की जांच हो रही है...',
  'Carefully examining your story across all 4 pillars...':
    'आपकी कहानी का चारों कानूनी स्तंभों (4 Pillars) पर विश्लेषण किया जा रहा है...',
  'Checking Indian Dhaarein, statutory remedies, seriousness, and official digital portals.':
    'भारतीय धाराएं, कानूनी सज़ा, मामले की गंभीरता और सरकारी पोर्टल तैयार किए जा रहे हैं।',
  'Dhaarein / Legal Provisions Violated': 'उल्लंघन की गई कानूनी धाराएं',
  'What Legal Action the Wrongdoer Faces Under Indian Law':
    'भारतीय कानून के तहत दोषी को क्या सज़ा मिल सकती है',
  'Digital First-Aid: Immediate Steps, Portals & Knowledge Guides':
    'डिजिटल फर्स्ट-एड: तत्काल कदम, सरकारी पोर्टल और यूट्यूब गाइड्स',
  'Official Portals (Hover on "i" for step-by-step guide)':
    'आधिकारिक सरकारी पोर्टल (स्टेप्स देखने के लिए "i" पर माउस ले जाएं)',
  'YouTube Knowledge Guides (What You Will Learn)':
    'यूट्यूब नॉलेज गाइड्स (आप इस वीडियो में क्या सीखेंगे)',
  'Lodge This Complaint in the Court of People': 'इस शिकायत को जनता की अदालत में दर्ज करें',
  'Drafting Your Complaint Post with AI...': 'AI आपकी शिकायत की पोस्ट तैयार कर रहा है...',
  'Find Lawyers Near You': 'अपने पास के वकील खोजें',
  'Your AI-Drafted Court of People Post': 'जनता की अदालत के लिए AI द्वारा तैयार आपकी पोस्ट',
  'Create your quick anonymous account (Name, Alias, Phone OTP & Gmail) in 30 seconds. Your real identity stays hidden while verified advocates comment on how they can help.':
    'सिर्फ 30 सेकंड में अपना गुप्त अकाउंट बनाएं (नाम, उपनाम, फोन OTP और Gmail)। आपकी असली पहचान छुपी रहेगी और सत्यापित वकील आपकी मदद के लिए टिप्पणी कर सकेंगे।',

  // Court of People & Leaderboard
  'The Court of People': 'जनता की अदालत',
  'Real matters stripped of private details. Citizens appear in blue with zero photos; verified advocates appear in gold.':
    'निजी जानकारी हटाकर साझा किए गए असली मामले। नागरिक बिना फोटो के नीले रंग में और सत्यापित वकील सुनहरे बैज के साथ दिखते हैं।',
  'Search matters...': 'मामले खोजें...',
  'Lodge Matter': 'शिकायत दर्ज करें',
  'citizens stood with this': 'नागरिक इस मामले के साथ हैं',
  'Responses Sorted by Helpfulness & Importance': 'मददगार और महत्वपूर्ण जवाब (प्राथमिकता के अनुसार)',
  'Reach Out Directly': 'सीधा संपर्क करें',
  'Share helpful legal guidance or experience...': 'मददगार कानूनी सलाह या अपना अनुभव साझा करें...',
  Reply: 'जवाब दें',
  'Sign in to comment & help this citizen': 'मदद करने और टिप्पणी करने के लिए साइन इन करें',
  'Sorted strictly by helpful likes earned on Court of People answers. Every advocate wrote a 1,700+ character story without copy-pasting.':
    'जनता की अदालत में मददगार जवाबों पर मिले लाइक्स के आधार पर रैंकिंग। हर वकील ने बिना कॉपी-पेस्ट किए 1,700+ अक्षरों में अपना अनुभव लिखा है।',
  'Read Full Story': 'पूरी कहानी पढ़ें',
  'Hide Story': 'बंद करें',
};

const FUNNY_AMOUNTS = [
  '₹4,20,000',
  '₹69,000',
  '₹42,069',
  '₹6,90,420',
  '₹4,200',
  '₹69,420',
];

const FUNNY_ALIASES = [
  'Amitabh_420',
  'Gabbar_Singh_69',
  'Circuit_Bhai_108',
  'Baburao_Ganpatrao',
  'Chulbul_Pandey_007',
];

/**
 * Renders text where every `[BLURRED AMOUNT: ...]`, `[Alias: ...]`, or `[MASKED-...]`
 * is blurred by default, and clicking any blurred chip reveals a funny representational
 * number/name right in place!
 */
export const ClickableBlurredText: React.FC<{ text: string }> = ({ text }) => {
  const [revealedIndices, setRevealedIndices] = useState<Record<number, boolean>>({});

  const toggleIndex = (idx: number) => {
    setRevealedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const parts = text.split(/(\[BLURRED AMOUNT: [^\]]+\]|\[BLURRED: [^\]]+\]|\[Alias: [^\]]+\]|\[MASKED-[^\]]+\])/g);

  return (
    <>
      {parts.map((part, i) => {
        const isAmount = part.startsWith('[BLURRED AMOUNT:') || part.startsWith('[BLURRED:');
        const isAlias = part.startsWith('[Alias:');
        const isMaskedId = part.startsWith('[MASKED-');

        if (!isAmount && !isAlias && !isMaskedId) {
          return <React.Fragment key={i}>{part}</React.Fragment>;
        }

        const revealed = Boolean(revealedIndices[i]);
        const funnyValue = isAmount
          ? FUNNY_AMOUNTS[i % FUNNY_AMOUNTS.length]
          : isAlias
          ? FUNNY_ALIASES[i % FUNNY_ALIASES.length]
          : 'PAN-42069X';

        if (!revealed) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggleIndex(i)}
              className="mx-1 inline-flex items-center rounded border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-xs font-bold text-amber-800 dark:text-amber-300 transition hover:border-amber-500"
              title="Click to reveal representational number/alias"
            >
              <span className="blur-[4px] select-none">
                {isAmount ? '₹88,888' : isAlias ? 'Hidden_Name' : 'ID-88888'}
              </span>
            </button>
          );
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => toggleIndex(i)}
            className="mx-1 inline-flex items-center gap-1 rounded border border-emerald-500/50 bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-extrabold text-emerald-800 dark:text-emerald-300"
            title="Funny representational value (click to blur again)"
          >
            <span>{funnyValue}</span>
            <span className="font-sans text-[9px] font-semibold opacity-75">(rep.)</span>
          </button>
        );
      })}
    </>
  );
};
