/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

import {
  type DiscoverSection,
  type DiscoverSectionItem,
  DiscoverSectionType,
  type Tag,
  type TagSection,
} from "@paperback/types";
import type { CheerioAPI } from "cheerio";

import { getUsePostIds } from "../generic/forms";
import { MadaraGeneric } from "../generic/main";
import { MadaraParser } from "../generic/parsers";

// coppied and adapted from generic/parsers
export class TashoParser extends MadaraParser {
  override async parseSearchTags($: CheerioAPI): Promise<TagSection[]> {
    const genres: Tag[] = [];

    for (const obj of $("a.rs-manga-library__genre-link, a.rs-manga-library__genre").toArray()) {
      const title = $("span", obj).first().text().trim();
      if (title == "All") continue;
      const id = $(obj).attr("href")?.split("/manga-genre/")[1] ?? "";

      if (!id || !title) {
        continue;
      }

      genres.push({ title: title, id: id });
    }

    const TagSections: TagSection[] = [{ title: "Genres", id: "genres", tags: genres }];

    return TagSections;
  }

  override async parseDiscoverSections(
    $: CheerioAPI,
    section: DiscoverSection,
    source: MadaraGeneric,
  ): Promise<DiscoverSectionItem[]> {
    const items: DiscoverSectionItem[] = [];

    for (const obj of $(".rs-manga-library__card").toArray()) {
      const image = encodeURI((await this.getImageSrc($("img", obj), source)) ?? "");
      const title = $(".rs-manga-library__card-title > a", obj).last().text();
      const slug = this.idCleaner($(".rs-manga-library__card-title > a", obj).attr("href") ?? "");
      const postId = $(obj)?.attr("id")?.split("manga-item-")[1] ?? "";
      const subtitle = $(".rs-manga-library__chapter", obj).first().text().trim();

      if (isNaN(Number(postId)) || !title) continue;

      switch (section.type) {
        case DiscoverSectionType.featured:
          items.push({
            mangaId: getUsePostIds(source.usePostIds) ? postId : slug,
            imageUrl: image,
            title: Application.decodeHTMLEntities(title),
            supertitle: Application.decodeHTMLEntities(subtitle),
            type: "featuredCarouselItem",
          });
          break;

        case DiscoverSectionType.prominentCarousel:
          items.push({
            mangaId: getUsePostIds(source.usePostIds) ? postId : slug,
            imageUrl: image,
            title: Application.decodeHTMLEntities(title),
            subtitle: Application.decodeHTMLEntities(subtitle),
            type: "prominentCarouselItem",
          });
          break;

        case DiscoverSectionType.simpleCarousel:
          items.push({
            mangaId: getUsePostIds(source.usePostIds) ? postId : slug,
            imageUrl: image,
            title: Application.decodeHTMLEntities(title),
            subtitle: Application.decodeHTMLEntities(subtitle),
            type: "simpleCarouselItem",
          });
          break;
      }
    }

    return items;
  }
  override async parseSearchResults($: CheerioAPI, source: MadaraGeneric) {
    const results = [];

    for (const obj of $(source.searchMangaSelector).toArray()) {
      const slug: string =
        ($("a", obj).attr("href") ?? "").replace(/\/$/, "").split("/").pop() ?? "";

      if (!slug) throw new Error(`Unable to parse slug  (${slug})!`);

      const title: string = $("a", obj).attr("title") ?? "";
      const image: string = encodeURI(await this.getImageSrc($("img", obj), source));
      const rating: string = $(source.searchRatingSelector, obj).text().trim() ?? "";
      const subtitle: string = $("a.rs-manga-library__chapter", obj).text().trim();

      const ratingStr = rating && rating !== "" ? ` | ⭐${rating}` : "";
      results.push({
        slug: slug,
        image: image,
        title: Application.decodeHTMLEntities(title),
        subtitle: Application.decodeHTMLEntities(
          subtitle ? `${subtitle}${ratingStr}` : `${ratingStr}`,
        ),
      });
    }

    return results;
  }
}
