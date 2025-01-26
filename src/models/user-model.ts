import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { Database } from "../database";

//activity record pattern
export class UserModel {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;

  constructor(data: Partial<UserModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: {
      name: string;
      email: string;
      password: string;
    },
    options?: { connection?: mysql.PoolConnection }
  ): Promise<UserModel> {
    const db = options?.connection ?? Database.getInstance();
    const { name, email, password } = data;
    const createdAt = new Date();
    const hashedPassword = UserModel.hashPassword(password);

    const [userResult] = await db.execute<mysql.ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, createdAt]
    );

    return new UserModel({
      ...data,
      password: hashedPassword,
      created_at: createdAt,
      id: userResult.insertId,
    });
  }

  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  static comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  async findAll(): Promise<UserModel[]> {
    const db = Database.getInstance();
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users"
    );
    return rows.map((row) => new UserModel(row as UserModel));
  }

  static async findById(id: number): Promise<UserModel | null> {
    const db = Database.getInstance();
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findByEmail(email: string): Promise<UserModel | null> {
    const db = Database.getInstance();
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  async update(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<mysql.ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      [this.name, this.email, this.password, this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }
  }

  async delete(): Promise<void> {
    const db = Database.getInstance();
    const [result] = await db.execute<mysql.ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Users not found");
    }
  }

  fill(data: Partial<UserModel>): void {
    if (data.id) this.id = data.id;
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.password) this.password = data.password;
    if (data.created_at) this.created_at = data.created_at;
  }
}
