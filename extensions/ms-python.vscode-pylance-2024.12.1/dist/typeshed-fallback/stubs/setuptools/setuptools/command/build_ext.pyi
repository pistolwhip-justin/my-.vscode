from _typeshed import Incomplete
from typing import ClassVar

from setuptools.dist import Distribution

from .._distutils.command.build_ext import build_ext as _build_ext

have_rtld: bool
use_stubs: bool
libtype: str

def if_dl(s): ...
def get_abi3_suffix(): ...

class build_ext(_build_ext):
    distribution: Distribution  # override distutils.dist.Distribution with setuptools.dist.Distribution
    editable_mode: ClassVar[bool]
    inplace: bool
    def run(self) -> None: ...
    def copy_extensions_to_source(self) -> None: ...
    def get_ext_filename(self, fullname): ...
    shlib_compiler: Incomplete
    shlibs: list[Incomplete]
    ext_map: dict[Incomplete, Incomplete]
    def initialize_options(self) -> None: ...
    extensions: list[Incomplete]
    def finalize_options(self) -> None: ...
    def setup_shlib_compiler(self) -> None: ...
    def get_export_symbols(self, ext): ...
    compiler: Incomplete
    def build_extension(self, ext) -> None: ...
    def links_to_dynamic(self, ext): ...
    def get_outputs(self): ...
    def get_output_mapping(self) -> dict[str, str]: ...
    def write_stub(self, output_dir, ext, compile: bool = False) -> None: ...

def link_shared_object(
    self,
    objects,
    output_libname,
    output_dir: Incomplete | None = None,
    libraries: Incomplete | None = None,
    library_dirs: Incomplete | None = None,
    runtime_library_dirs: Incomplete | None = None,
    export_symbols: Incomplete | None = None,
    debug: bool = False,
    extra_preargs: Incomplete | None = None,
    extra_postargs: Incomplete | None = None,
    build_temp: Incomplete | None = None,
    target_lang: Incomplete | None = None,
) -> None: ...