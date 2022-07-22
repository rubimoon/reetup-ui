import { format, formatDistanceToNow } from "date-fns";

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), "dd MMM yyyy h:mm aa");

export const formatDate = (date: string | Date) =>
  format(new Date(date), "dd MMM yyyy");

export const convertDateISOString = (date: string | Date) =>
  new Date(date).toISOString();

export const getDistanceToNow = (date: string | Date) =>
  formatDistanceToNow(new Date(date));

export const formatDoLLL = (date: string | Date) =>
  format(new Date(date), "do LLL");

export const formatTime = (date: string | Date) =>
  format(new Date(date), "h:mm a");
