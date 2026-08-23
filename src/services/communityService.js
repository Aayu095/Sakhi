import {
  addDoc,
  collection,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const STORY_LIMIT = 30;
const HELP_LIMIT = 30;
const MAX_TITLE_LENGTH = 100;
const MAX_STORY_LENGTH = 900;
const MAX_HELP_LENGTH = 700;
const CONTACT_PATTERN = /(?:https?:\/\/|www\.|\b\d[\d\s-]{7,}\d\b)/i;

function requireUser(user) {
  if (!user?.uid) {
    throw new Error('Community इस्तेमाल करने के लिए साइन इन करें।');
  }
}

function cleanText(value) {
  return (value || '').trim().replace(/\s+/g, ' ');
}

function validateText(value, label, maximumLength) {
  const text = cleanText(value);
  if (!text) throw new Error(`${label} लिखें।`);
  if (text.length > maximumLength) throw new Error(`${label} ${maximumLength} अक्षरों तक रखें।`);
  if (CONTACT_PATTERN.test(text)) throw new Error('सुरक्षा के लिए फोन नंबर या लिंक Community में साझा न करें।');
  return text;
}

function publicName(profile, user) {
  return cleanText(profile?.name || user?.displayName || 'सखी की सहेली').split(' ')[0] || 'सखी की सहेली';
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function ensureCommunityProfile(user, profile) {
  requireUser(user);
  const db = getFirestore();
  await setDoc(doc(db, 'communityProfiles', user.uid), {
    userId: user.uid,
    displayName: publicName(profile, user),
    learningGoals: Array.isArray(profile?.learningGoals) ? profile.learningGoals.slice(0, 6) : [],
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToStories(onData, onError) {
  const db = getFirestore();
  return onSnapshot(
    query(collection(db, 'communityStories'), orderBy('createdAt', 'desc'), limit(STORY_LIMIT)),
    (snapshot) => onData(mapSnapshot(snapshot)),
    onError,
  );
}

export function subscribeToHelpRequests(onData, onError) {
  const db = getFirestore();
  return onSnapshot(
    query(collection(db, 'communityHelpRequests'), orderBy('createdAt', 'desc'), limit(HELP_LIMIT)),
    (snapshot) => onData(mapSnapshot(snapshot)),
    onError,
  );
}

export async function createCommunityStory(user, profile, story) {
  requireUser(user);
  const title = validateText(story.title, 'कहानी का शीर्षक', MAX_TITLE_LENGTH);
  const content = validateText(story.content, 'अपनी कहानी', MAX_STORY_LENGTH);
  const category = cleanText(story.category) || 'सीखना';
  const db = getFirestore();

  await addDoc(collection(db, 'communityStories'), {
    authorId: user.uid,
    authorName: publicName(profile, user),
    title,
    content,
    category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function createHelpRequest(user, profile, helpRequest) {
  requireUser(user);
  const title = validateText(helpRequest.title, 'मदद का विषय', MAX_TITLE_LENGTH);
  const description = validateText(helpRequest.description, 'अपनी समस्या', MAX_HELP_LENGTH);
  const category = cleanText(helpRequest.category) || 'सीखना';
  const db = getFirestore();

  await addDoc(collection(db, 'communityHelpRequests'), {
    authorId: user.uid,
    authorName: publicName(profile, user),
    title,
    description,
    category,
    isResolved: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function offerCommunityHelp(user, profile, requestId, message) {
  requireUser(user);
  const cleanedMessage = validateText(message, 'मदद का संदेश', 400);
  const db = getFirestore();
  await setDoc(doc(db, 'communityHelpRequests', requestId, 'offers', user.uid), {
    helperId: user.uid,
    helperName: publicName(profile, user),
    message: cleanedMessage,
    createdAt: serverTimestamp(),
  });
}

export async function reportCommunityContent(user, contentType, contentId, reason) {
  requireUser(user);
  const db = getFirestore();
  await setDoc(doc(db, 'communityReports', `${contentType}_${contentId}_${user.uid}`), {
    reporterId: user.uid,
    contentType,
    contentId,
    reason: cleanText(reason) || 'अनुचित सामग्री',
    createdAt: serverTimestamp(),
  });
}
