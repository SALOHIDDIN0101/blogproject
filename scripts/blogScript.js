const blogId = new URLSearchParams(window.location.search).get('id')
const blogDetailWrapper = document.querySelector('.blog__detail-wrapper')

// Line
const topLine = document.querySelector('.top-line')

// page links
const previewBlogLink = document.querySelector('#preview__blog-link')
const upcomingBlogLink = document.querySelector('#upcoming__blog-link')

// Find upcoming blog
function findUpcomingBlog (blog, blogs) {
  blogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  for (let i = 0; i < blogs.length; i++) {
    if (blogs[i].id == blog.id) return blogs[i + 1]
  }
  return undefined
}

// Find preview blog
function findPreviewBlog (blog, blogs) {
  blogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  for (let i = 0; i < blogs.length; i++) {
    if (blogs[i].id == blog.id) return blogs[i - 1]
  }
  return undefined
}

// Update top line progress
function updateTopLine () {
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  if (scrollHeight <= clientHeight) {
    topLine.style.display = 'none'
    return
  }

  const scrollPosition = window.scrollY
  const scrollableHeight = scrollHeight - clientHeight
  const scrollPercentage = (scrollPosition / scrollableHeight) * 100

  if (scrollPosition > 0) {
    topLine.style.display = 'block'
    topLine.style.width = scrollPercentage + '%'
  } else {
    topLine.style.display = 'none'
  }
}

window.addEventListener('scroll', updateTopLine)
window.addEventListener('resize', updateTopLine)

window.onload = () => {
  updateTopLine()

  if (!blogId) {
    window.location.href = '/pages/blog.html'
    return
  }

  load(blogId)
}

// Load blogs
function load () {
  fetch('http://localhost:3000/blogs')
    .then(response => response.json())
    .then(data => render(data))
}

// Render the blog details
function render (blogs) {
  const blog = blogs.filter(b => b.id == blogId)[0]

  blogDetailWrapper.innerHTML = `
    <div class="row">
        <h1 class="h1">${generateTitle(blog.current_titles)}</h1>
        <div class="col-12">
            <p class="text-black-50">${blog.created_at}</p>
        </div>
    </div>
    <div id="line"></div>
    <div class="blog__detail-content">
        ${generateBase(blog)}
    </div>
    `

  makePage(blog, blogs)
}

// Create page links for preview and next blogs
function makePage (blog, blogs) {
  const previewBlog = findPreviewBlog(blog, blogs)

  if (previewBlog) {
    previewBlogLink.href = '/pages/blogDetail.html?id=' + previewBlog.id
  } else {
    previewBlogLink.innerText = ''
    previewBlogLink.style.display = 'none'
  }

  const upcomingBlog = findUpcomingBlog(blog, blogs)

  if (upcomingBlog) {
    upcomingBlogLink.href = '/pages/blogDetail.html?id=' + upcomingBlog.id
  } else {
    upcomingBlogLink.innerText = ''
    upcomingBlogLink.style.display = 'none'
  }
}

// Generate the base structure for the blog
function generateBase (blog) {
  let base = ``

  if (blog.texts) base = generateTexts(blog.base, blog.texts)
  if (blog.links) base = generateA(base, blog.links)
  if (blog.quotes) base = generateQuotes(base, blog.quotes)
  if (blog.images) base = generateImages(base, blog.images)
  if (blog.lists) base = generateLists(base, blog.lists)
  if (blog.subtitles) base = generateSubtitles(base, blog.subtitles)

  return base
}

// Generate subtitles
function generateSubtitles (base, subtitles) {
  for (const subtitle of subtitles) {
    base = base.replaceAll(
      subtitle.id,
      `<h4 class="mt-4 mb-4">${subtitle.value}</h4>`
    )
  }
  return base
}

// Generate lists
function generateLists (base, lists) {
  for (const list of lists) {
    let cList = `<${list.type}>`

    for (const item of list.items) {
      cList += `<li class="cList">${item.value}</li>`
    }

    cList += `</${list.type}>`
    base = base.replaceAll(list.id, cList)
  }
  return base
}

// Generate images
function generateImages (base, images) {
  for (const image of images) {
    base = base.replaceAll(
      image.id,
      `<img class="w-100 mt-1 mb-2" src="${image.url}" alt="${image.alt}">`
    )
  }
  return base
}

// Generate quotes
function generateQuotes (base, quotes) {
  return quotes.reduce(
    (updateBase, quote) =>
      updateBase.replaceAll(
        quote.id,
        `<blockquote>${quote.value}</blockquote>`
      ),
    base
  )
}

// Generate texts
function generateTexts (base, texts) {
  return texts.reduce(
    (updateBase, text) =>
      updateBase.replaceAll(text.id, `<p class="justify">${text.value}</p>`),
    base
  )
}

// Generate links
function generateA (base, as) {
  for (const a of as) {
    base = base.replaceAll(
      a.id,
      `<a style="${a.style}" href="${a.link}">${a.value}</a>`
    )
  }
  return base
}

// Generate title
function generateTitle (titles) {
  let cTitle = '<p>'

  for (const title of titles) {
    cTitle += `<span style="${title.style}">${title.value}</span>`
  }
  cTitle += '</p>'
  return cTitle
}
