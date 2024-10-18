export const isAppBuiltInBrowser = () => {
  const userAgent = navigator.userAgent;

  return /FBAN|FBAV|Instagram|Twitter|Line|Snapchat|WhatsApp|Messenger|LinkedIn/i.test(
    userAgent,
  );
};
