!(function () {
  "use strict";
  var e = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ),
    i = {
      processedItems: new Set(),
      createItemKey: function (e, t, i) {
        return (e + "|" + t + "|" + i).toLowerCase();
      },
      isGloballyProcessed: function (e, t, i) {
        return (
          this.createItemKey(e, t, i).toLowerCase(),
          this.processedItems.has(this.createItemKey(e, t, i))
        );
      },
      markAsProcessed: function (e, i, n) {
        var l = this.createItemKey(e, i, n);
        this.processedItems.add(l);
      },
      isDuplicateItem: function (e, t) {
        for (var i = 0; i < t.length; i++) {
          var n = t[i];
          if (
            n.call === e.call &&
            n.location === e.location &&
            n.collection === e.collection
          )
            return !0;
        }
        return !1;
      },
      getTitle: function (e) {
        for (
          var i = [
              ".displayElementText.text-p.INITIAL_TITLE_SRCH",
              ".displayElementText.INITIAL_TITLE_SRCH",
              ".detail_biblio_title",
              ".TITLE_ABNP:not(.TITLE_ABNP_label)",
              ".INITIAL_TITLE_SRCH:not(.INITIAL_TITLE_SRCH_label)",
            ],
            n = 0;
          n < i.length;
          n++
        ) {
          var l = document.querySelector(i[n]);
          if (l && l.textContent && l.textContent.trim()) return l;
        }
        for (
          var o = [
              "[class*='TITLE']:not([class*='label']):not([class*='_label'])",
              ".detail_biblio .INITIAL_TITLE_SRCH",
              "#detail_biblio0 .INITIAL_TITLE_SRCH",
            ],
            a = 0;
          a < o.length;
          a++
        )
          for (
            var r = document.querySelectorAll(o[a]), c = 0;
            c < r.length;
            c++
          ) {
            var s = r[c];
            if (
              s &&
              s.textContent &&
              s.textContent.trim() &&
              !s.classList.contains("label") &&
              !s.textContent.trim().endsWith(":")
            )
              return s;
          }
        var d = document.title;
        return d
          ? { textContent: (d = d.replace(/ - .*$/, "").trim()), innerText: d }
          : null;
      },
      scrapeDetailRows: function (l) {
        if (e && (l = this.scrapeMobileCallNumbers(l)).length > 0) return l;
        for (
          var o = [
              ".detailItemsTableRow:not(.libmaps-proc)",
              "tbody .detailItemsTableRow:not(.libmaps-proc)",
              ".detailItemsTable tr:not(.libmaps-proc)",
              "[class*='detailItems'] tr:not(.libmaps-proc)",
            ],
            a = null,
            r = 0;
          r < o.length && !a;
          r++
        )
          if ((a = document.querySelectorAll(o[r])).length > 0) break;
        if (!a || 0 === a.length) return l;
        for (r = 0; r < a.length; r++) {
          var c = a[r],
            s = i.getTitle(c),
            d = c.querySelector(".detailItemsTable_CALLNUMBER"),
            u = c.querySelector(".detailItemsTable_LIBRARY"),
            p = c.querySelector(".detailItemsTable_SD_HZN_COLLECTION"),
            g = c.querySelector(".detailItemsTable_ITYPE");
          if (d && u) {
            c.classList.add("libmaps-proc");
            var m =
                u.querySelector(".asyncFieldLIBRARY:last-of-type") ||
                u.querySelector(".asyncFieldLIBRARY") ||
                u,
              f = n.extractText(m),
              y = n.extractText(d),
              b = n.extractText(s),
              v = "";
            if (g) {
              var C = n.extractText(g);
              C && n.isValidCollection(C) && (v = C);
            }
            (v && "" !== v) || (v = n.extractCollectionText(p));
            var L = n.isValidLocation(f),
              h = n.isValidCollection(v),
              I = y && y.length > 0;
            if (!i.isGloballyProcessed(y, f, v) && I && L && h) {
              var x = {
                element: c,
                buttonElement: d,
                location: f,
                call: y,
                title: b,
                collection: v,
              };
              if (i.isDuplicateItem(x, l)) continue;
              (l.push(x), i.markAsProcessed(y, f, v));
            }
          }
        }
        return l;
      },
      scrapeMobileCallNumbers: function (e) {
        var l = document.querySelectorAll(".detailItemsListItem");
        if (l.length > 0) {
          for (var o = 0; o < l.length; o++) {
            var a = l[o],
              r = a.querySelectorAll("span"),
              c = "",
              s = "",
              d = "",
              u = "";
            (r.forEach(function (e) {
              var t = e.className || "",
                i = e.textContent.trim();
              (-1 !== t.indexOf("CALLNUMBER") && (c = i),
                -1 !== t.indexOf("LIBRARY") &&
                  -1 !== t.indexOf("asyncField") &&
                  (s = i),
                -1 !== t.indexOf("ITYPE") && (d = i),
                -1 !== t.indexOf("SD_HZN_COLLECTION") && (u = i));
            }),
              s ||
                ((p = a.querySelector(".asyncFieldLIBRARY")) &&
                  (s = p.textContent.trim())));
            var p,
              g = "";
            if (
              (d && "" !== d && "-" !== d && "Searching..." !== d
                ? (g = d)
                : u &&
                  "" !== u &&
                  "-" !== u &&
                  "Searching..." !== u &&
                  "Unknown" !== u &&
                  (g = u),
              c && s && c.length > 2)
            ) {
              var m = n.isValidLocation(s),
                f = n.isValidCollection(g);
              if (m && f) {
                var y = (c + "|" + s + "|" + g).toLowerCase();
                i.processedItems.has(y) ||
                  (i.processedItems.add(y),
                  e.push({
                    element: a,
                    buttonElement: a,
                    location: s,
                    call: c,
                    title: document.title,
                    collection: g,
                  }));
              }
            }
          }
          return e;
        }
        var b = document.querySelectorAll(
          ".detailItemsTable_CALLNUMBER:not(.libmaps-processed)",
        );
        for (o = 0; o < b.length; o++) {
          var v = b[o],
            C = n.extractText(v);
          if (
            C &&
            0 !== C.length &&
            ![
              "Shelf Number",
              "Call Number",
              "Location",
              "Collection",
              "Library",
              "Status",
              "Due Date",
            ].some(function (e) {
              return C.toLowerCase().includes(e.toLowerCase());
            }) &&
            !(C.length < 3) &&
            /[A-Za-z]/.test(C) &&
            /[0-9]/.test(C)
          ) {
            v.classList.add("libmaps-processed");
            var L = v.closest("tr") || v.closest("div") || v.parentElement;
            if (L) {
              var h =
                  L.querySelector(".detailItemsTable_LIBRARY") ||
                  L.querySelector('[class*="LIBRARY"]'),
                I =
                  L.querySelector(".detailItemsTable_SD_HZN_COLLECTION") ||
                  L.querySelector('[class*="COLLECTION"]'),
                x = L.querySelector(".detailItemsTable_ITYPE"),
                T = "David O. McKay Library";
              if (h) {
                var S =
                  h.querySelector(".asyncFieldLIBRARY:last-of-type") ||
                  h.querySelector(".asyncFieldLIBRARY") ||
                  h;
                T = n.extractText(S) || T;
              }
              g = "";
              if (x) {
                var E = n.extractText(x);
                E && n.isValidCollection(E) && (g = E);
              }
              (g && "" !== g) ||
                (I && (g = n.extractCollectionText(I)),
                (g && n.isValidCollection(g)) || (g = "General Books"));
              var M = i.getTitle()
                  ? n.extractText(i.getTitle())
                  : document.title,
                O = n.isValidLocation(T),
                w = n.isValidCollection(g),
                R = C && C.length > 0;
              if (!i.isGloballyProcessed(C, T, g) && R && O && w) {
                var A = {
                  element: L || v,
                  buttonElement: v,
                  location: T,
                  call: C,
                  title: M,
                  collection: g,
                };
                if (i.isDuplicateItem(A, e)) continue;
                (e.push(A), i.markAsProcessed(C, T, g));
              }
            }
          }
        }
        return e;
      },
      scrapeDom: function () {
        return i.scrapeDetailRows([]);
      },
      attachButton: function (e, i) {
        (e.buttonElement || e.element).appendChild(i);
      },
      setupListeners: function () {},
    },
    n = {
      callbackId: 1,
      siteConfig: {},
      cleanText: function (e) {
        return e
          ? e
              .trim()
              .replace(/<script[^>]*>.*?<\/script>/gi, "")
              .replace(/<[^>]*>/g, "")
              .replace(/\n/g, " ")
              .replace(/\s+/g, " ")
              .replace(/Searching\.\.\./g, "")
              .replace(/Unknown$/i, "")
              .replace(/^\s+|\s+$/g, "")
          : "";
      },
      extractText: function (e) {
        if (!e) return "";
        var t = e.textContent || e.innerText || "";
        return n.cleanText(t);
      },
      extractCollectionText: function (e) {
        if (!e) return "";
        for (
          var i = "",
            l = e.querySelectorAll(".asyncFieldSD_HZN_COLLECTION"),
            o = 0;
          o < l.length;
          o++
        ) {
          var a = l[o],
            r = a.textContent.trim();
          if (
            "Searching..." !== r &&
            "Unknown" !== r &&
            "" !== r &&
            (!a.classList.contains("hidden") ||
              ("Unknown" !== r && "" !== r)) &&
            r &&
            r.length > 0
          ) {
            i = r;
            break;
          }
        }
        if (!i) {
          var c = (e.textContent || e.innerText || "")
            .replace(/Searching\.\.\./g, "")
            .replace(/Unknown/g, "")
            .trim();
          c.length > 0 && "Collection" !== c && (i = c);
        }
        if (!i || "Unknown" === i || "" === i) return "";
        var s = n.cleanText(i),
          d = Object.keys(n.siteConfig.validCollectionNameMap);
        if (n.siteConfig.validCollectionNameMap[s]) return s;
        for (o = 0; o < d.length; o++) if (0 === s.indexOf(d[o])) return d[o];
        for (var u = s.toLowerCase(), p = 0; p < d.length; p++)
          if (0 === u.indexOf(d[p].toLowerCase())) return d[p];
        return s;
      },
      normalizeLocationForService: function (e) {
        return (
          {
            "David O. McKay Library": "McKay Library",
            "David O McKay Library": "McKay Library",
            "McKay Library": "McKay Library",
          }[e] || e
        );
      },
      injectStyles: function (e, i) {
        var n = document.createElement("style");
        ((n.type = "text/css"),
          (n.innerText = i),
          e.insertBefore(n, e.firstChild));
      },
      createModal: function (e, i) {
        var l = n.siteConfig.domain + "/libmaps/catalog?" + i.toString(),
          o = n.siteConfig.getModalHtml(e, l),
          a = document.createElement("div");
        return (a.insertAdjacentHTML("afterbegin", o), a);
      },
      createIcon: function () {
        var e = n.siteConfig.button.icon;
        return 0 === e.length
          ? null
          : new DOMParser().parseFromString(e, "application/xml")
              .documentElement;
      },
      createKeyHandler: function () {
        return function (e) {
          13 === e.keyCode && (e.stopPropagation(), this.click());
        };
      },
      createModalClickHandler: function (e, i) {
        return function (l) {
          if ((l.preventDefault(), l.stopPropagation(), !e.modal)) {
            var o = n.createModal(e, i);
            ((e.modal = document.body.appendChild(o)),
              e.modal
                .querySelector(".springy-close")
                .addEventListener("click", function () {
                  (e.modal
                    .querySelector(".springy-underlay")
                    .classList.remove("springy-underlay-active"),
                    e.modal
                      .querySelector(".springy-modal")
                      .classList.remove("springy-modal-active"));
                }),
              e.modal
                .querySelector(".springy-print")
                .addEventListener("click", function () {
                  window.open(
                    n.siteConfig.domain + "/libmaps/call/print?" + i.toString(),
                    e.call,
                    "height=860,width=630",
                  );
                }));
          }
          (e.modal
            .querySelector(".springy-underlay")
            .classList.add("springy-underlay-active"),
            e.modal
              .querySelector(".springy-modal")
              .classList.add("springy-modal-active"));
        };
      },
      createButton: function (e) {
        var i = n.createIcon(),
          l = document.createTextNode(n.siteConfig.button.label),
          o = new URLSearchParams();
        if (
          (o.set("call", e.call),
          o.set("location", n.normalizeLocationForService(e.location)),
          o.set("collection", e.collection || ""),
          o.set("title", e.title || ""),
          n.siteConfig.isModalWanted)
        ) {
          var a = document.createElement("button");
          return (
            a.setAttribute("type", "button"),
            a.classList.add("springy-button"),
            null !== i && a.appendChild(i),
            a.appendChild(l),
            (a.onclick = n.createModalClickHandler(e, o)),
            a.addEventListener("keydown", n.createKeyHandler()),
            a
          );
        }
        var r = document.createElement("a");
        return (
          r.classList.add("springy-button"),
          null !== i && r.appendChild(i),
          r.appendChild(l),
          r.setAttribute("target", "_blank"),
          (r.href =
            n.siteConfig.domain + "/libmaps/catalog/full?" + o.toString()),
          r.addEventListener("click", function (e) {
            return (e.stopPropagation(), this.blur(), !1);
          }),
          r.addEventListener("keydown", n.createKeyHandler()),
          r
        );
      },
      isValidLocation: function (e) {
        if (n.siteConfig.isUsingFixedLocation) return !0;
        if (!e || 0 === e.length) return !1;
        var i = e.trim();
        return !0 === n.siteConfig.validLocationNameMap[i];
      },
      isValidCollection: function (e) {
        if (!n.siteConfig.isValidCollectionRequired) return !0;
        if (!e || 0 === e.length) return !1;
        var i = e.trim();
        return !0 === n.siteConfig.validCollectionNameMap[i];
      },
      setupButtons: function (e) {
        for (var l = 0; l < e.length; l++) {
          var o = e[l];
          if (
            0 !== o.call.length &&
            n.isValidLocation(o.location) &&
            n.isValidCollection(o.collection)
          ) {
            var a = n.createButton(o),
              r = document.createElement("div");
            (r.classList.add("springy-button-div"),
              r.insertAdjacentElement("afterbegin", a),
              i.attachButton(o, r));
          }
        }
      },
      scrapeDomGeneric: function () {
        for (
          var e = [],
            t = document.querySelectorAll(
              ".libmaps-button:not(.libmaps-proc), .libmap-button:not(.libmaps-proc)",
            ),
            i = 0;
          i < t.length;
          i++
        ) {
          var n = t[i];
          n.classList.add("libmaps-proc");
          var l = n.dataset.callnumber || "",
            o = n.dataset.location || "";
          0 !== l.length &&
            0 !== o.length &&
            e.push({
              element: n,
              buttonElement: n,
              location: o,
              call: l,
              title: n.dataset.title || "",
              collection: n.dataset.collection || "",
            });
        }
        return e;
      },
      scrape: function () {
        var l = n.siteConfig.isGenericScrapeWanted
          ? n.scrapeDomGeneric()
          : i.scrapeDom();
        return (n.setupButtons(l), l);
      },
      watch: function () {
        var i = 0,
          l = e ? 60 : 30,
          o = setInterval(
            function () {
              if (
                document.querySelector(".detailItemsTableRow") ||
                document.querySelector("tbody .detailItemsTableRow") ||
                document.querySelector(".detailItemsTable") ||
                document.querySelector(".detailItemsList") ||
                document.querySelector(".detailItemsListItem") ||
                document.querySelector(".asyncFieldSD_ITEM_STATUS")
              ) {
                for (
                  var a = document.querySelectorAll(
                      ".asyncInProgressSD_HZN_COLLECTION, .asyncInProgressLIBRARY, .asyncInProgressSD_ITEM_STATUS",
                    ),
                    r = !1,
                    c = 0;
                  c < a.length;
                  c++
                )
                  if (
                    !a[c].classList.contains("hidden") &&
                    a[c].textContent.includes("Searching")
                  ) {
                    r = !0;
                    break;
                  }
                if (r && i < l) return;
                clearInterval(o);
                var s = e ? 2e3 : 1e3;
                setTimeout(function () {
                  n.scrape();
                }, s);
              } else
                i >= l &&
                  (clearInterval(o),
                  setTimeout(
                    function () {
                      ((n.siteConfig.isGenericScrapeWanted = !0), n.scrape());
                    },
                    e ? 2e3 : 1e3,
                  ));
            },
            e ? 750 : 500,
          );
      },
    };
  ((n.siteConfig = {
    domain: "https://byui.libcal.com",
    iid: 4251,
    isUsingFixedLocation: 0,
    isValidCollectionRequired: 1,
    validLocationNameMap: {
      "David O. McKay Library": !0,
      "McKay Library": !0,
      "David O McKay Library": !0,
    },
    validCollectionNameMap: {
      "Audio Books": !0,
      "CD": !0,
      "CDs": !0,
      "Double Oversize Books": !0,
      "DVD": !0,
      "DVDs": !0,
      "General Books": !0,
      "General Books - 1st Floor": !0,
      "Juvenile Literature": !0,
      "Juvenile Books": !0,
      "LP Records - Special Collections": !0,
      "Map": !0,
      "Oversize Books": !0,
      "Oversize Juvenile": !0,
      "Oversize Juvenile Books": !0,
      "Popular Books": !0,
      "Reserve Area": !0,
      "Reserve Books": !0,
      "Sheet Music": !0,
      "SP+ Special Collections Oversized": !0,
      "Special Coll.": !0,
      "Special Coll.-Campus Authors": !0,
      "Special Coll.-Caxton Press": !0,
      "Special Coll.-Church History": !0,
      "Special Coll.-Education Collection": !0,
      "Special Coll.-Family History Books": !0,
      "Special Coll.-Greater Yellowstone Ecosystem": !0,
      "Special Coll.-Hinckley Music": !0,
      "Special Coll.-Hinckley Music Collection": !0,
      "Special Coll.-Historical Literature": !0,
      "Special Coll.-Historical Literature and Reference": !0,
      "Special Coll.-LP Records": !0,
      "Special Coll.-Manuscripts": !0,
      "Special Coll.-Maps": !0,
      "Special Coll.-Microfilm": !0,
      "Special Coll.-Music": !0,
      "Special Coll.-Oversized": !0,
      "Special Coll.-Printing Reference": !0,
      "Special Coll.-Scriptures": !0,
      "Special Coll.-Upper Snake River Valley History": !0,
      "Special Coll.-Vardis Fisher": !0,
      "Special Collections": !0,
      "Teacher Learning Center": !0,
      "Technical Services": !0,
      "Technical ServicesBooks": !0,
      "Univ. Archives-Campus Publications": !0,
      "Univ. Archives-Campus Speeches": !0,
    },
    button: {
      label: "Map It",
      icon: '<svg class="springy-icon" viewBox="796 796 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M970.135,870.134C970.135,829.191,936.943,796,896,796c-40.944,0-74.135,33.191-74.135,74.134 c0,16.217,5.221,31.206,14.055,43.41l-0.019,0.003L896,996l60.099-82.453l-0.019-0.003 C964.912,901.34,970.135,886.351,970.135,870.134z M896,900.006c-16.497,0-29.871-13.374-29.871-29.872s13.374-29.871,29.871-29.871 s29.871,13.373,29.871,29.871S912.497,900.006,896,900.006z"/></svg>',
      border: "6px",
    },
    isModalWanted: 1,
    isGenericScrapeWanted: 0,
    getModalHtml: function (e, t) {
      return (
        '<div class="springy-underlay"><div class="springy-modal" data-location="' +
        e.location +
        '" data-zone="' +
        (e.zone || "") +
        '" data-call="' +
        e.call +
        '" tabindex="0"><div class="springy-header"><h1>' +
        e.title +
        '</h1><div class="springy-header-buttons"><button class="springy-print" aria-label="Print Map"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></button><button class="springy-close" aria-label="Close" data-placement="bottom"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg></button></div></div><div class="springy-content"><iframe title="Map Image" src="' +
        t +
        '" style="position: relative; width: 100%; height: 100%; border: none;"></iframe></div></div></div>'
      );
    },
    css: ".springy-button-div { display: inline-block; } .springy-button { text-indent: 0; cursor: pointer; position: relative; padding: 6px 12px 6px 6px; box-sizing: border-box; border-width: 0; border-radius: 6px; color: #FFFFFF; background-color: #337AB7; display: inline-block; white-space: nowrap; line-height: 16px; } a.springy-button { color: #FFFFFF; text-decoration: none; } .springy-button:hover { color: #FFFFFF; background-color: #286090; } a.springy-button:hover { color: #FFFFFF; background-color: #286090; } .springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } a.springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } .springy-icon { padding-right: 4px; background-repeat: no-repeat; display: inline-block; vertical-align: middle; fill: currentColor; height: 16px; width: 16px; min-height: 16px; min-width: 16px; } .springy-underlay { padding: 0; top: 0; left: 0; width: 100%; height: 100%; display: none; background-color: rgba(0, 0, 0, .5); flex-direction: column; align-items: center; } .springy-underlay-active { display: flex; position: fixed; z-index: 30000; } .springy-modal { font-family: Arial, Helvetica, Verdana; display: flex; flex-direction: column; overflow-y: auto; width: 80%; max-width: 1200px; height: 90vh; margin-top: 3vh; background-color: #fff; border-radius: 5px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); opacity: 0; } .springy-modal-active { opacity: 1; } .springy-header { display: flex; justify-content: space-between; border-bottom: 1px solid #d6d6d6; margin-bottom: 10px; margin-top: 14px; } .springy-header h1 { margin: 0 0 12px 12px; font-size: 24px; max-width: 80%; padding: 0; } .springy-header-buttons { margin-right: 12px; height: 100%; } .springy-header-buttons button { vertical-align: middle; padding: 2px 14px; margin-left: 6px; height: unset; border: none; background: none; color: rgb(51, 51, 51); } .springy-header-buttons button:hover { background: rgba(0,0,0,.07); box-shadow: 0 0 1px 1px rgba(0,0,0,.14) } .springy-header-buttons svg { width: 16px; height: 16px; vertical-align: -0.125em; } .springy-content { display: flex; flex-grow: 1; } .springy-directions-email-form button, .springy-directions-email-result { margin-left: 10px; }",
  }),
    (function (t) {
      if ("loading" === document.readyState) {
        var i = !1;
        (document.addEventListener("DOMContentLoaded", function () {
          i || ((i = !0), t());
        }),
          document.addEventListener("readystatechange", function () {
            i ||
              ("interactive" !== document.readyState &&
                "complete" !== document.readyState) ||
              ((i = !0), t());
          }),
          window.addEventListener("load", function () {
            i || ((i = !0), t());
          }),
          e &&
            setTimeout(function () {
              i || ((i = !0), t());
            }, 3e3));
      } else t();
    })(function () {
      (n.injectStyles(document.head, n.siteConfig.css), n.watch());
    }));
})();
