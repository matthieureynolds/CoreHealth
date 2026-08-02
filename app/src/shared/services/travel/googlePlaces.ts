import { z } from "zod";

/**
 * The Google Places result shape, as this app actually consumes it.
 *
 * Four services parse nearby-search responses (water stations, pharmacies,
 * healthcare facilities, city search). Each had grown its own inline schema and
 * its own `place: any` mapper, so the same provider contract was described
 * four times and enforced in none of them.
 *
 * Everything here is optional except `place_id`: Google omits fields freely
 * depending on the place type, and the mappers already use optional chaining
 * throughout. The point is to replace `any` with a shape the compiler can check,
 * not to reject records that are merely sparse.
 */
const GooglePlaceSchema = z.object({
  place_id: z.string(),
  name: z.string().optional(),
  vicinity: z.string().optional(),
  formatted_address: z.string().optional(),
  formatted_phone_number: z.string().optional(),
  website: z.string().optional(),
  rating: z.number().optional(),
  user_ratings_total: z.number().optional(),
  price_level: z.number().optional(),
  business_status: z.string().optional(),
  types: z.array(z.string()).optional(),
  geometry: z
    .object({
      location: z.object({ lat: z.number(), lng: z.number() }),
    })
    .optional(),
  opening_hours: z
    .object({
      open_now: z.boolean().optional(),
      weekday_text: z.array(z.string()).optional(),
      periods: z
        .array(
          z.object({
            open: z
              .object({ day: z.number(), time: z.string() })
              .partial()
              .optional(),
            close: z
              .object({ day: z.number(), time: z.string() })
              .partial()
              .optional(),
          }),
        )
        .optional(),
    })
    .nullish(),
  photos: z
    .array(z.object({ photo_reference: z.string() }).partial())
    .optional(),
});

export type GooglePlace = z.infer<typeof GooglePlaceSchema>;
export type GooglePlaceOpeningHours = GooglePlace["opening_hours"];

/** Envelope returned by the nearby-search and text-search endpoints. */
export const GooglePlacesNearbySchema = z.object({
  status: z.string(),
  results: z.array(GooglePlaceSchema).optional(),
  next_page_token: z.string().optional(),
});

/** Envelope returned by the place-details endpoint. */
export const GooglePlaceDetailsSchema = z.object({
  status: z.string(),
  result: GooglePlaceSchema.nullish(),
});
