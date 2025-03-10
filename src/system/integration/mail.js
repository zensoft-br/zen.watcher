import { mailDirect } from "./mailDirect.js";
import { mailQueue } from "./mailQueue.js";
import { mailWatcher } from "./mailWatcher.js";

/**
 * This is the /mail service hub. It will forward according to the path suffix
 *
 * @param {*} event
 */
export async function mail(event) {
  if (event.requestContext?.http?.method === "POST") {
    // Direct e-mails for entities
    if (event.requestContext?.http?.path === "/mail/direct") {
      return mailDirect(event);
    }

    // E-mails from queues
    if (event.requestContext?.http?.path === "/mail/queue") {
      return mailQueue(event);
    }

    // E-mails from Zen ERP watchers
    if (event.requestContext?.http?.path === "/mail/watcher") {
      return mailWatcher(event);
    }
  }

  return { statusCode: 400 };
}