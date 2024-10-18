export const isWebView = () => {
  const userAgent = navigator.userAgent;

  return /FBAN|FBAV|Instagram|Twitter|Line|Snapchat|WhatsApp|Messenger/i.test(
    userAgent,
  );
};
