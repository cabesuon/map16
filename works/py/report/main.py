import pdfkit

options = {
    'page-size': 'A4',
    'margin-top': '0.75in',
    'margin-right': '0.75in',
    'margin-bottom': '0.75in',
    'margin-left': '0.75in',
}

def main():
    with open('report.html') as f:
        pdfkit.from_file(f, 'report.pdf', options=options)

if __name__ == '__main__':
    main()
