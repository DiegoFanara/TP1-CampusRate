export const toPublicJson = {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: { _id?: unknown }) => {
    delete ret._id;
    return ret;
  },
};