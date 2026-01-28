import jsPDF from 'jspdf';

// 类型定义
export interface BookData {
  id: string | number; // 支持字符串或数字ID
  data: {
    central_idea: string;
    child_age: string;
    illustration_style_label: string;
    themes: string[];
    scenes: Array<{
      text: string;
      img_text_prompt: string;
      imageUrl?: string | null;
    }>;
  };
}

// 标签翻译工具函数
const labelTranslation = (label: string) => {
  let theme = '';
  let style = '';
  let age = '';

  // 主题翻译
  if (label === 'cognitive_learning') {
    theme = '认知学习';
  } else if (label === 'emotional_education') {
    theme = '情感教育';
  } else if (label === 'social_behavior') {
    theme = '社会行为';
  } else if (label === 'natural_science') {
    theme = '自然科学';
  } else if (label === 'fantasy_adventure') {
    theme = '奇幻冒险';
  } else if (label === 'adventure_exploration') {
    theme = '冒险探索';
  }

  // 风格翻译
  if (label === 'watercolor') {
    style = '水彩画风格';
  } else if (label === 'crayon') {
    style = '蜡笔画风格';
  } else if (label === 'cartoon') {
    style = '卡通动画风格';
  } else if (label === 'clay_3d') {
    style = '3D黏土风格';
  } else if (label === 'paper_cut') {
    style = '剪纸拼贴风格';
  }

  // 年龄翻译
  if (label === 'infant') {
    age = '0-2岁婴幼儿';
  } else if (label === 'preschool') {
    age = '3-6岁学龄前儿童';
  } else if (label === 'early_elementary') {
    age = '6-8岁小学低年级';
  }

  return { theme, style, age };
};

// 加载图片并转换为 base64
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域问题

    img.onload = () => {
      // 创建 canvas 来转换图片
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取canvas上下文'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      // 转换为 base64
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataURL);
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
};

// 将中文文字渲染为图片（解决乱码问题）
const createTextImage = (text: string, widthMm: number): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 转换 mm 到像素 (假设 150 DPI)
  const widthPx = Math.floor(widthMm * 5.9); // 1mm ≈ 5.9px at 150dpi
  canvas.width = widthPx;
  canvas.height = 400; // 初始高度

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 文字样式
  ctx.fillStyle = '#333333';
  ctx.font = '32px "Microsoft YaHei", "SimHei", "Arial", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // 文字换行处理
  const maxWidth = widthPx - 60; // 左右边距
  const lineHeight = 48;
  const words = text.split('');
  let line = '';
  let y = 30;
  const lines: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // 根据实际行数调整 canvas 高度
  const actualHeight = Math.max(100, y + lineHeight + 30);
  canvas.height = actualHeight;

  // 重新绘制背景（因为改变了高度）
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 重新设置文字样式
  ctx.fillStyle = '#333333';
  ctx.font = '32px "Microsoft YaHei", "SimHei", "Arial", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // 绘制所有行
  y = 30;
  lines.forEach((textLine) => {
    ctx.fillText(textLine, 30, y);
    y += lineHeight;
  });

  return canvas.toDataURL('image/png');
};

// 主导出函数
export const exportBooksToPDF = async (
  booksToExport: BookData[],
  onProgress?: (current: number, total: number) => void
): Promise<boolean> => {
  try {
    console.log('开始生成PDF...');

    // 创建 PDF 文档 (A4 尺寸)
    const pdf = new jsPDF({
      orientation: 'portrait', // 竖向
      unit: 'mm',
      format: 'a4',
    });

    let isFirstPage = true;
    const pageWidth = 210; // A4 宽度 mm
    const pageHeight = 297; // A4 高度 mm
    const margin = 15;

    // 遍历每本书
    for (let bookIndex = 0; bookIndex < booksToExport.length; bookIndex++) {
      const book = booksToExport[bookIndex];
      const scenes = book.data.scenes;

      console.log(`正在处理第 ${bookIndex + 1}/${booksToExport.length} 本书`);
      onProgress?.(bookIndex + 1, booksToExport.length);

      // 添加封面页
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // 封面页 - 使用图片渲染中文
      try {
        const coverTitle = book.data.central_idea || '绘本';
        const ageLabel = labelTranslation(book.data.child_age).age;

        // 创建标题图片
        const titleImage = createTextImage(coverTitle, pageWidth - 2 * margin);
        pdf.addImage(titleImage, 'PNG', margin, 40, pageWidth - 2 * margin, 30);

        // 创建年龄信息图片
        const ageText = `适合年龄：${ageLabel}`;
        const ageImage = createTextImage(ageText, pageWidth - 2 * margin);
        pdf.addImage(ageImage, 'PNG', margin, 80, pageWidth - 2 * margin, 20);

        // 添加页数信息（英文）
        pdf.setFontSize(12);
        pdf.text(`Total Pages: ${scenes.length}`, pageWidth / 2, 120, {
          align: 'center',
        });
      } catch (error) {
        console.error('封面生成失败:', error);
        pdf.setFontSize(20);
        pdf.text('Picture Book', pageWidth / 2, 50, { align: 'center' });
      }

      // 遍历每个场景
      for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
        const scene = scenes[sceneIndex];

        console.log(`  - 场景 ${sceneIndex + 1}/${scenes.length}`);

        // 添加新页
        pdf.addPage();

        try {
          // 添加图片
          if (scene.imageUrl) {
            const base64Image = await loadImageAsBase64(scene.imageUrl);

            // 图片占据上半部分
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = 150;

            pdf.addImage(
              base64Image,
              'JPEG',
              margin,
              margin,
              imgWidth,
              imgHeight
            );

            // 添加中文文字（渲染为图片）
            if (scene.text && scene.text.trim()) {
              const textImage = createTextImage(scene.text, imgWidth);
              pdf.addImage(
                textImage,
                'PNG',
                margin,
                margin + imgHeight + 10,
                imgWidth,
                60
              );
            }
          } else {
            // 没有图片，只显示文字
            if (scene.text && scene.text.trim()) {
              const textImage = createTextImage(
                scene.text,
                pageWidth - 2 * margin
              );
              pdf.addImage(
                textImage,
                'PNG',
                margin,
                margin,
                pageWidth - 2 * margin,
                80
              );
            }
          }

          // 添加页码（英文，不会乱码）
          pdf.setFontSize(10);
          pdf.text(
            `${sceneIndex + 1} / ${scenes.length}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
          );
        } catch (error) {
          console.error('场景处理失败:', error);
          pdf.setFontSize(12);
          pdf.text('Content loading failed', margin, 50);
        }
      }
    }

    // 下载 PDF
    const fileName = `绘本合集_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

    console.log('PDF生成完成');
    return true;
  } catch (error) {
    console.error('PDF生成失败:', error);
    throw error;
  }
};
