$es.define({
    id: 'fast',
    template: `
    <article>
        <header align=center>$\{this.data.title\}</header>
        <div>
        ${`
        <br>
        <strong>&lt;1></strong>
        From: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article
        The HTML $lt;article> element represents a self-contained composition in a document, page, application, or site, 
        which is intended to be independently distributable or reusable (e.g., in syndication). Examples include: a forum post, 
        a magazine or newspaper article, or a blog entry.
        A given document can have multiple articles in it; 
        for example, on a blog that shows the text of each article one after another as the reader scrolls, 
        each post would be contained in an $lt;article> element, possibly with one or more $lt;section>s within.
        Usage notesSection
        Each $lt;article> should be identified, typically by including a heading ($lt;h1>-$lt;h6> element) as a child of the $lt;article> element.
        When an $lt;article> element is nested, the inner element represents an article related to the outer element. 
        For example, the comments of a blog post can be $lt;article> elements nested in the $lt;article> representing the blog post.
        Author information of an $lt;article> element can be provided through the $lt;address> element, but it doesn't apply to nested $lt;article> elements.
        The publication date and time of an $lt;article> element can be described using the datetime attribute of a $lt;time> element. 
        Note that the pubdate attribute of $lt;time> is no longer a part of the W3C HTML5 standard.`.repeat(25)}
        </div>
    </article>
    `,
    data: {
        title: 'This is page 2!'
    },
    styles: {
        default: {
            height: '100%',
            width: '100%'
        }
    },
    updates: {
        data: {
            title(newVal) {
                this.$element.children[0].children[0].innerHTML = newVal;
                console.log('title=', {newVal, elapsed:Date.now() - window.tstick});
                return true;
            }
        }
    }
});