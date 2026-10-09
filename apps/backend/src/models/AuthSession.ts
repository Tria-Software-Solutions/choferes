import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User";

// Server-side record of a refresh-token session. The refresh JWT carries the
// session id (`sid`) and the current token id (`jti`); this row is what makes
// rotation and revocation possible (a stateless JWT cannot be un-issued).
export class AuthSession extends Model {
  public id!: string; // session id (sid), a UUID

  public userId!: number;

  public refreshJti!: string; // jti of the currently valid refresh token

  public previousJti?: string | null; // last rotated-out jti (short reuse grace)

  public rotatedAt?: Date | null; // when refreshJti last changed

  public expiresAt!: Date;

  public revokedAt?: Date | null;
}

AuthSession.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    refreshJti: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    previousJti: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rotatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "AuthSession",
    tableName: "auth_sessions",
  },
);

export default AuthSession;
