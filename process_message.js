module.exports.remove_footer = (items) => {
    /**
     * SCANDAL、結成15周年イヤー第2弾作品「アイボリー」リリース＆MV公開(E-TALENTBANK)
     * 「爆イケ」横浜流星、佐野勇斗との先輩後輩交換ショットに反響「オフショ感最高」「尊すぎます」(E-TALENTBANK)
     *
     * 末尾の (E-TALENTBANK)を削除
     */
    if (items.length < 2) {
        // 比較仕様がないのであきらめる
        return items
    }
    let footer_length = null
    let matched_0 = false
    let matched_1 = false
    let i = 0
    for (i = 0; i < items[0].title[0].length; i++) {
        const matched = items[0].title[0].slice(-i) === items[1].title[0].slice(-i)
        if (!matched_0 && matched) {
            matched_0 = true
        }
        if (matched_0 && matched) {
            matched_1 = true
        }
        if (matched_1 && !matched) {
            matched_1 = false
            footer_length = i
            break
            // STOP
        }
    }

    return footer_length === null
        ? items
        : items.map((e) => e.title[0].substr(0, e.title[0].length - footer_length + 1))
}
