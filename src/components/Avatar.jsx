// 通用头像组件：有头像显示图片，无头像显示首字母渐变占位
export default function Avatar({
  src,
  name,
  className = 'w-16 h-16 rounded-2xl',
  textSize = 'text-2xl',
  imgClassName = 'w-full h-full object-cover',
}) {
  const initial = (name || '?').toString().trim().charAt(0).toUpperCase() || '?';
  if (src) {
    return (
      <div className={`shrink-0 overflow-hidden bg-gradient-to-br from-[#fb7299] to-[#00a1d6] ${className}`}>
        <img src={src} alt="" className={imgClassName} />
      </div>
    );
  }
  return (
    <div className={`shrink-0 flex items-center justify-center bg-gradient-to-br from-[#fb7299] to-[#00a1d6] text-white font-bold ${textSize} ${className}`}>
      {initial}
    </div>
  );
}
