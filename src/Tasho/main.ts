/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

import type { Tag, TagSection } from "@paperback/types";
import * as cheerio from "cheerio";

import { MadaraGeneric } from "../generic/main";
import { TashoParser } from "./parser";
import pbconfig from "./pbconfig";

const DOMAIN: string = "https://tasho.net";

class TashoExtension extends MadaraGeneric {
  constructor() {
    super({
      domain: DOMAIN,
      directoryPath: "manga",
      name: pbconfig.name,
      contentRating: pbconfig.contentRating,
      language: pbconfig.language,
      usePostIds: true,
      chapterEndpoint: 2,
      searchMangaSelector: "article.rs-manga-library__card",
      parser: new TashoParser(),
      searchRatingSelector: "span.rs-manga-library__rating-value",
    });
  }
  override async fetchGenres(): Promise<Tag[]> {
    const [_response, buffer] = await Application.scheduleRequest({
      url: `${this.domain}/manga/`,
      method: "GET",
    });

    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));

    const tagSections = await this.parser.parseSearchTags($);
    const genreTags = tagSections.find((x) => x.id === "genres") as TagSection;

    return genreTags.tags;
  }
}

export const Tasho = new TashoExtension();
