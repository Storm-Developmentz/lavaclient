import { Socket } from "./structures/Socket";
import { Player } from "./structures/Player";
import { Filters } from "./structures/Filters";

export class Structures {
  private static structures: Classes = {
    player: Player,
    socket: Socket,
    filters: Filters
  };

  /**
   * Extend the specified structure.
   * @param name The structure to extend.
   * @param extend The extender function.
   * @since 2.0.0
   */
  static extend<K extends keyof Classes, E extends Classes[K]>(
    name: K,
    extend: (base: Classes[K]) => E
  ): E {
    const extended = extend(this.structures[name]);
    return (this.structures[name] = extended);
  }

  /**
   * Get the specified structure.
   * @param name The structure to get.
   * @since 2.0.0
   */
  static get<K extends keyof Classes>(name: K): Classes[K] {
    return this.structures[name];
  }
}

export interface Classes {
  socket: typeof Socket;
  player: typeof Player;
  filters: typeof Filters;
}