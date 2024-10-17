import { EventRecord } from './event-record.model';

export interface PageEventRecords {
  eventId: string;
  firstRecord?: EventRecord;
  lastRecord?: EventRecord;
}
